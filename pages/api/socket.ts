import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import randomLetter from '../../app/Helpers/randomLetter';
import { selectCurrentWord, wordsFilter } from '../../app/Helpers/wordsFilter';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface Player {
  id: string;
  username: string;
  score: number;
  completed: boolean;
  attempts: number;
  socketId: string;
  ready: boolean;
}

interface Room {
  id: string;
  name: string;
  password?: string;
  owner: string;
  maxPlayers: number;
  wordCount: number; // 20, 50, 100
  currentWordIndex: number;
  gameState: GameState;
  gameTimer: NodeJS.Timeout | null;
  waitTimer: NodeJS.Timeout | null;
}

interface GameState {
  currentWord: string;
  letter: string;
  players: Player[];
  gameActive: boolean;
  timeLeft: number;
  roundNumber: number;
  phase: 'waiting' | 'playing' | 'results' | 'finished';
  roomOwner: string;
}

// Odaları global olarak tutuyoruz
const rooms = new Map<string, Room>();

const createRoom = (roomData: {
  roomId: string; // UUID from frontend
  name: string;
  password?: string;
  owner: string;
  maxPlayers: number;
  wordCount: number;
}): Room => {
  const room: Room = {
    id: roomData.roomId, // Use the provided UUID
    name: roomData.name,
    password: roomData.password,
    owner: roomData.owner,
    maxPlayers: roomData.maxPlayers,
    wordCount: roomData.wordCount,
    currentWordIndex: 0,
    gameState: {
      currentWord: '',
      letter: '',
      players: [],
      gameActive: false,
      timeLeft: 60,
      roundNumber: 1,
      phase: 'waiting',
      roomOwner: roomData.owner
    },
    gameTimer: null,
    waitTimer: null
  };
  
  rooms.set(roomData.roomId, room);
  return room;
};

const initializeNewRound = (room: Room) => {
  const letter = randomLetter();
  const wordList = wordsFilter(letter);
  const currentWord = selectCurrentWord(wordList);
  
  room.gameState = {
    ...room.gameState,
    currentWord,
    letter,
    timeLeft: 60,
    phase: 'playing',
    players: room.gameState.players.map(player => ({
      ...player,
      completed: false,
      attempts: 0,
      ready: false
    }))
  };
  
  room.currentWordIndex += 1;
  
  return { word: currentWord, letter, roundNumber: room.gameState.roundNumber };
};

const startGameTimer = (io: SocketIOServer, roomId: string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  
  if (room.gameTimer) clearInterval(room.gameTimer);
  
  room.gameTimer = setInterval(() => {
    room.gameState.timeLeft -= 1;
    
    if (room.gameState.timeLeft <= 0) {
      // Oyun süresi bitti
      clearInterval(room.gameTimer!);
      room.gameTimer = null;
      
      room.gameState.phase = 'results';
      room.gameState.timeLeft = 10; // 10 saniye sonuç gösterme
      
      console.log(`Room ${roomId} - Round bitti, sonuçlar gösteriliyor`);
      io.to(roomId).emit('gameState', cleanGameState(room.gameState));
      
      // Oyun bitip bitmediğini kontrol et
      if (room.currentWordIndex >= room.wordCount) {
        room.gameState.phase = 'finished';
        io.to(roomId).emit('gameFinished', room.gameState);
        return;
      }
      
      // 10 saniye sonra yeni round başlat
      room.waitTimer = setTimeout(() => {
        room.gameState.roundNumber += 1;
        console.log(`Room ${roomId} - Yeni round başlıyor: ${room.gameState.roundNumber}`);
        const roundData = initializeNewRound(room);
        io.to(roomId).emit('newRound', roundData);
        io.to(roomId).emit('gameState', cleanGameState(room.gameState));
        startGameTimer(io, roomId);
      }, 10000);
    } else {
      // Her saniye günceleme gönder
      io.to(roomId).emit('gameState', cleanGameState(room.gameState));
    }
  }, 1000);
};

const checkAllPlayersCompleted = (io: SocketIOServer, roomId: string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const activePlayers = room.gameState.players.filter(p => p.socketId);
  const completedPlayers = activePlayers.filter(p => p.completed);
  
  if (activePlayers.length > 0 && completedPlayers.length === activePlayers.length) {
    // Tüm oyuncular tamamladı, erken bitir
    if (room.gameTimer) {
      clearInterval(room.gameTimer);
      room.gameTimer = null;
    }
    
    room.gameState.phase = 'results';
    room.gameState.timeLeft = 10;
    
    io.to(roomId).emit('gameState', cleanGameState(room.gameState));
    
    // Oyun bitip bitmediğini kontrol et
    if (room.currentWordIndex >= room.wordCount) {
      room.gameState.phase = 'finished';
      io.to(roomId).emit('gameFinished', room.gameState);
      return;
    }
    
    // 10 saniye sonra yeni round
    room.waitTimer = setTimeout(() => {
      room.gameState.roundNumber += 1;
      const roundData = initializeNewRound(room);
      io.to(roomId).emit('newRound', roundData);
      io.to(roomId).emit('gameState', cleanGameState(room.gameState));
      startGameTimer(io, roomId);
    }, 10000);
  }
};

const checkAllPlayersReady = (io: SocketIOServer, roomId: string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const activePlayers = room.gameState.players.filter(p => p.socketId);
  const readyPlayers = activePlayers.filter(p => p.ready);
  
  // En az 1 oyuncu olmalı, tüm aktif oyuncular hazır olmalı ve phase waiting olmalı
  if (activePlayers.length >= 1 && readyPlayers.length === activePlayers.length && readyPlayers.length > 0 && room.gameState.phase === 'waiting') {
    // Tüm oyuncular hazır, oyunu başlat
    console.log(`Room ${roomId} - Tüm oyuncular hazır, oyun başlıyor`);
    const roundData = initializeNewRound(room);
    io.to(roomId).emit('newRound', roundData);
    io.to(roomId).emit('gameState', cleanGameState(room.gameState));
    startGameTimer(io, roomId);
  }
};

const cleanGameState = (gameState: GameState) => ({
  currentWord: gameState.currentWord,
  letter: gameState.letter,
  players: gameState.players,
  gameActive: gameState.gameActive,
  timeLeft: gameState.timeLeft,
  totalTime: 60, // Total round time
  roundNumber: gameState.roundNumber,
  phase: gameState.phase,
  roomOwner: gameState.roomOwner
});

const getRoomList = () => {
  return Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    hasPassword: !!room.password,
    currentPlayers: room.gameState.players.filter(p => p.socketId).length,
    maxPlayers: room.maxPlayers,
    wordCount: room.wordCount,
    owner: room.owner,
    phase: room.gameState.phase
  }));
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if ((res.socket as any).server.io) {
    console.log('Socket.io zaten çalışıyor');
  } else {
    console.log('Socket.io başlatılıyor...');
    const httpServer: NetServer = (res.socket as any).server;
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      console.log('Kullanıcı bağlandı:', socket.id);

      // Oda listesini al
      socket.on('getRoomList', () => {
        socket.emit('roomList', getRoomList());
      });

      // Oda oluştur
      socket.on('createRoom', (data: {
        roomId: string; // UUID from frontend
        name: string;
        password?: string;
        username: string;
        userId: string;
        maxPlayers: number;
        wordCount: number;
      }) => {
        // Check if room already exists
        if (rooms.has(data.roomId)) {
          socket.emit('joinRoomError', 'Bu oda ID\'si zaten kullanımda');
          return;
        }

        const room = createRoom({
          roomId: data.roomId,
          name: data.name,
          password: data.password,
          owner: data.username,
          maxPlayers: data.maxPlayers,
          wordCount: data.wordCount
        });
        
        // Oda kurucusunu oyuncu olarak ekle
        const ownerPlayer: Player = {
          id: data.userId,
          username: data.username,
          score: 0,
          completed: false,
          attempts: 0,
          socketId: socket.id,
          ready: false
        };
        room.gameState.players.push(ownerPlayer);
        
        console.log(`Room created: ${room.id} by ${data.username}, phase: ${room.gameState.phase}, ready: ${ownerPlayer.ready}`);
        
        socket.join(room.id);
        
        // Sadece gerekli bilgileri gönder (circular reference'ı önlemek için)
        socket.emit('roomCreated', { 
          roomId: room.id, 
          roomInfo: {
            id: room.id,
            name: room.name,
            owner: room.owner,
            maxPlayers: room.maxPlayers,
            wordCount: room.wordCount
          }
        });
        socket.emit('gameState', cleanGameState(room.gameState));
        
        // Tüm clientlara yeni oda listesini gönder
        io.emit('roomList', getRoomList());
      });

      // Odaya katıl
      socket.on('joinRoom', (data: { 
        roomId: string; 
        username: string; 
        userId: string; 
        password?: string 
      }) => {
        const room = rooms.get(data.roomId);
        if (!room) {
          socket.emit('joinRoomError', 'Oda bulunamadı');
          return;
        }

        // Şifre kontrolü
        if (room.password && room.password !== data.password) {
          socket.emit('joinRoomError', 'Yanlış şifre');
          return;
        }

        // Oda dolu mu kontrol et
        const activePlayers = room.gameState.players.filter(p => p.socketId);
        if (activePlayers.length >= room.maxPlayers) {
          const existingPlayer = room.gameState.players.find(p => p.username === data.username);
          if (!existingPlayer) {
            socket.emit('joinRoomError', 'Oda dolu');
            return;
          }
        }

        socket.join(data.roomId);

        const existingPlayerIndex = room.gameState.players.findIndex(
          p => p.username === data.username
        );

        if (existingPlayerIndex !== -1) {
          // Mevcut oyuncu yeniden bağlandı
          room.gameState.players[existingPlayerIndex].socketId = socket.id;
          // Yeniden bağlanan oyuncuların ready durumunu false yap
          if (room.gameState.phase === 'waiting') {
            room.gameState.players[existingPlayerIndex].ready = false;
          }
        } else {
          // Yeni oyuncu
          const newPlayer: Player = {
            id: data.userId,
            username: data.username,
            score: 0,
            completed: false,
            attempts: 0,
            socketId: socket.id,
            ready: false
          };
          room.gameState.players.push(newPlayer);
        }

        console.log(`Player ${data.username} joined room ${data.roomId}, phase: ${room.gameState.phase}`);
        
        // Sadece gerekli bilgileri gönder (circular reference'ı önlemek için)
        socket.emit('roomJoined', { 
          roomId: data.roomId, 
          roomInfo: {
            id: room.id,
            name: room.name,
            owner: room.owner,
            maxPlayers: room.maxPlayers,
            wordCount: room.wordCount
          }
        });
        socket.emit('gameState', cleanGameState(room.gameState));
        socket.to(data.roomId).emit('gameState', cleanGameState(room.gameState));

        // Tüm clientlara güncel oda listesini gönder
        io.emit('roomList', getRoomList());
      });

      // Oyuncu hazır durumu değiştirme
      socket.on('playerReady', (data: { 
        roomId: string; 
        playerId: string; 
        ready: boolean 
      }) => {
        console.log(`Player ready event: ${data.playerId} -> ${data.ready} in room ${data.roomId}`);
        const room = rooms.get(data.roomId);
        if (!room) return;

        const playerIndex = room.gameState.players.findIndex(p => p.id === data.playerId);
        if (playerIndex !== -1) {
          const playerName = room.gameState.players[playerIndex].username;
          console.log(`Setting player ${playerName} ready status to: ${data.ready}`);
          room.gameState.players[playerIndex].ready = data.ready;
          
          io.to(data.roomId).emit('gameState', cleanGameState(room.gameState));
          checkAllPlayersReady(io, data.roomId);
        }
      });

      // Oyuncu oyunu tamamladı
      socket.on('playerCompleted', (data: { 
        roomId: string; 
        playerId: string; 
        attempts: number; 
        won: boolean 
      }) => {
        const room = rooms.get(data.roomId);
        if (!room) return;

        const playerIndex = room.gameState.players.findIndex(p => p.id === data.playerId);
        if (playerIndex !== -1) {
          room.gameState.players[playerIndex].completed = true;
          room.gameState.players[playerIndex].attempts = data.attempts;
          
          // Yeni puan sistemi: 1.deneme=100, 2.deneme=85, 3.deneme=70, 4.deneme=55, 5.deneme=40, 6.deneme=25, bilemeyen=0
          let points = 0;
          if (data.won) {
            const pointsTable = [100, 85, 70, 55, 40, 25]; // attempts 1-6 için
            points = pointsTable[data.attempts - 1] || 0; // Array index 0-5, attempts 1-6
          }
          // Bilemeyen (won=false) zaten 0 puan alacak
          
          const playerName = room.gameState.players[playerIndex].username;
          const oldScore = room.gameState.players[playerIndex].score;
          room.gameState.players[playerIndex].score += points;
          const newScore = room.gameState.players[playerIndex].score;
          
          console.log(`=== PUAN DEBUG ===`);
          console.log(`Player: ${playerName}`);
          console.log(`Attempts: ${data.attempts}, Won: ${data.won}`);
          console.log(`Points Table: [100, 85, 70, 55, 40, 25]`);
          console.log(`Points for attempt ${data.attempts}: ${points}`);
          console.log(`Score: ${oldScore} + ${points} = ${newScore}`);
          console.log(`=== END PUAN DEBUG ===`);

          io.to(data.roomId).emit('playerCompleted', data.playerId);
          io.to(data.roomId).emit('gameState', cleanGameState(room.gameState));
          
          checkAllPlayersCompleted(io, data.roomId);
        }
      });

      // Odadan çık
      socket.on('leaveRoom', (data: { roomId: string }) => {
        socket.leave(data.roomId);
        
        const room = rooms.get(data.roomId);
        if (room) {
          // Oyuncuyu listeden çıkar
          const playerIndex = room.gameState.players.findIndex(p => p.socketId === socket.id);
          if (playerIndex !== -1) {
            const playerName = room.gameState.players[playerIndex].username;
            room.gameState.players.splice(playerIndex, 1);
            console.log(`Player ${playerName} left room ${data.roomId}`);
          }
          
          // Oda boş kaldıysa hemen sil
          if (room.gameState.players.length === 0) {
            console.log(`Room ${data.roomId} is empty, deleting immediately`);
            if (room.gameTimer) clearInterval(room.gameTimer);
            if (room.waitTimer) clearTimeout(room.waitTimer);
            rooms.delete(data.roomId);
            io.emit('roomList', getRoomList());
          } else {
            io.to(data.roomId).emit('gameState', cleanGameState(room.gameState));
            io.emit('roomList', getRoomList());
          }
        }
      });

      // Oda sahibinin odayı kapatması
      socket.on('closeRoom', (data: { roomId: string; ownerId: string }) => {
        const room = rooms.get(data.roomId);
        if (!room) {
          socket.emit('closeRoomError', 'Oda bulunamadı');
          return;
        }

        // Sadece oda sahibi kapatabilir
        const ownerPlayer = room.gameState.players.find(p => p.id === data.ownerId);
        if (!ownerPlayer || ownerPlayer.username !== room.owner) {
          socket.emit('closeRoomError', 'Sadece oda sahibi odayı kapatabilir');
          return;
        }

        console.log(`Room ${data.roomId} closed by owner ${room.owner}`);
        
        // Tüm oyunculara odanın kapatıldığını bildir
        io.to(data.roomId).emit('roomClosed', 'Oda sahibi tarafından kapatıldı');
        
        // Timer'ları temizle
        if (room.gameTimer) clearInterval(room.gameTimer);
        if (room.waitTimer) clearTimeout(room.waitTimer);
        
        // Odayı sil
        rooms.delete(data.roomId);
        
        // Güncel oda listesini gönder
        io.emit('roomList', getRoomList());
      });

      socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);
        
        // Tüm odalardan oyuncuyu çıkar
        rooms.forEach((room, roomId) => {
          const playerIndex = room.gameState.players.findIndex(p => p.socketId === socket.id);
          if (playerIndex !== -1) {
            const playerName = room.gameState.players[playerIndex].username;
            room.gameState.players[playerIndex].socketId = '';
            console.log(`Player ${playerName} disconnected from room ${roomId}`);
            
            // Aktif oyuncu kalmadıysa odayı kapat
            const activePlayers = room.gameState.players.filter(p => p.socketId);
            if (activePlayers.length === 0) {
              console.log(`No active players in room ${roomId}, closing room immediately`);
              if (room.gameTimer) {
                clearInterval(room.gameTimer);
                room.gameTimer = null;
              }
              if (room.waitTimer) {
                clearTimeout(room.waitTimer);
                room.waitTimer = null;
              }
              
              // Odayı hemen sil (bekleme yok)
              rooms.delete(roomId);
              io.emit('roomList', getRoomList());
            } else {
              // Hala aktif oyuncular varsa state'i güncelle
              io.to(roomId).emit('gameState', cleanGameState(room.gameState));
              io.emit('roomList', getRoomList());
            }
          }
        });
      });
    });
  }
  res.end();
};

export default SocketHandler; 