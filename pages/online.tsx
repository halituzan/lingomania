import {
  setFilterWords,
  setFirstLetter,
  setResult,
  setSelectWord,
  winHandler,
} from "@/lib/features/letter/letterSlice";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import Keyboard from "../app/Components/Keyboard";
import Row from "../app/Components/Row";
import { wordsFilter } from "../app/Helpers/wordsFilter";
import toast from "react-hot-toast";

type Props = {};

interface Player {
  id: string;
  username: string;
  score: number;
  completed: boolean;
  attempts: number;
  ready: boolean;
}

interface Room {
  id: string;
  name: string;
  hasPassword: boolean;
  currentPlayers: number;
  maxPlayers: number;
  wordCount: number;
  owner: string;
  phase: "waiting" | "playing" | "results" | "finished";
}

interface GameState {
  currentWord: string;
  letter: string;
  players: Player[];
  gameActive: boolean;
  timeLeft: number;
  totalTime: number;
  roundNumber: number;
  phase: "waiting" | "playing" | "results" | "finished";
  roomOwner: string;
}
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
const Online = (props: Props) => {
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentWord: "",
    letter: "",
    players: [],
    gameActive: false,
    timeLeft: 60,
    totalTime: 60,
    roundNumber: 1,
    phase: "waiting",
    roomOwner: "",
  });
  const [username, setUsername] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentRoomId, setCurrentRoomId] = useState<string>("");

  // Oda sistemi state'leri
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: "",
    password: "",
    maxPlayers: 4,
    wordCount: 20,
  });
  const [joinPassword, setJoinPassword] = useState("");
  const [view, setView] = useState<"lobby" | "game">("lobby"); // lobby veya game
  const [roomShareUrl, setRoomShareUrl] = useState<string>("");

  const dispatch = useDispatch();
  const { firstLetter, selectWord, result, win } = useSelector(
    (state: any) => state.letter
  );

  const [keyboardWord, setKeyboardWord] = useState("");
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [rowOk, setRowOK] = useState({
    row1: {
      status: true,
      word: "",
      solves: [],
    },
    row2: {
      status: false,
      word: "",
      solves: [],
    },
    row3: {
      status: false,
      word: "",
      solves: [],
    },
    row4: {
      status: false,
      word: "",
      solves: [],
    },
    row5: {
      status: false,
      word: "",
      solves: [],
    },
    row6: {
      status: false,
      word: "",
      solves: [],
    },
  });
  const [rowMeans, setRowMeans] = useState([]);

  const getWords = async (word: string) => {
    try {
      const res = await axios.get("/api/get-word?word=" + word);
      if (res?.data?.word) {
        dispatch(setResult(res.data.word));
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  // URL'den room parametresini kontrol et (sadece ilk yüklemede)
  useEffect(() => {
    if (router.isReady && username) {
      const { room } = router.query;
      if (room && typeof room === "string") {
        // URL'de room ID varsa direkt odaya katılmaya çalış
        setCurrentRoomId(room);
        setView("game");
      }
    }
  }, [router.isReady, username]); // router.query'yi kaldırdık

  // WebSocket bağlantısı kurma
  useEffect(() => {
    if (!username) return; // Kullanıcı adı yoksa bağlantı kurma

    // Socket.IO sunucusuna bağlan (Heroku'daki ayrı sunucu)
    const SOCKET_SERVER_URL = "http://localhost:3001";
    // const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL ||
    //   (process.env.NODE_ENV === 'production'
    //     ? 'https://lingomania.onrender.com' // Varsayılan Render.com URL
    //     : 'http://localhost:3001');

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      upgrade: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      // Bağlandığında oda listesini al
      newSocket.emit("getRoomList");

      // Eğer URL'de room ID varsa otomatik katıl
      const { room } = router.query;
      if (room && typeof room === "string") {
        const userId = uuidv4();
        setCurrentUserId(userId);
        newSocket.emit("joinRoom", {
          roomId: room,
          username: username.trim(),
          userId: userId,
        });
      }
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket bağlantısı kesildi");
    });

    // Oda listesi güncelleme
    newSocket.on("roomList", (roomList: Room[]) => {
      setRooms(roomList);
    });

    // Oda oluşturma başarılı
    newSocket.on("roomCreated", (data: { roomId: string; roomInfo: any }) => {
      setCurrentRoomId(data.roomId);
      setView("game");
      setShowCreateRoom(false);

      // Paylaşım URL'sini oluştur
      const shareUrl = `${window.location.origin}/online?room=${data.roomId}`;
      setRoomShareUrl(shareUrl);

      // URL'yi güncelle
      router.replace(`/online?room=${data.roomId}`, undefined, {
        shallow: true,
      });
    });

    // Odaya katılma başarılı
    newSocket.on("roomJoined", (data: { roomId: string; roomInfo: any }) => {
      setCurrentRoomId(data.roomId);
      setView("game");
      setShowJoinRoom(false);
      setSelectedRoom(null);
      setJoinPassword("");

      // URL'yi güncelle
      router.replace(`/online?room=${data.roomId}`, undefined, {
        shallow: true,
      });
    });

    // Oda katılma hatası
    newSocket.on("joinRoomError", (error: string) => {
      alert(error);
      // Hata durumunda lobby'ye dön
      setView("lobby");
      setCurrentRoomId("");
      router.replace("/online", undefined, { shallow: true });
    });

    newSocket.on("gameState", (state: GameState) => {
      setGameState(state);
    });

    newSocket.on(
      "newRound",
      (data: { word: string; letter: string; roundNumber: number }) => {
        // Yeni round başladığında state'i temizle
        resetGameState();
        dispatch(setSelectWord(data.word));
        dispatch(setFirstLetter(data.letter));
        dispatch(setFilterWords(wordsFilter(data.letter)));
        setKeyboardWord(data.letter);
        dispatch(winHandler(""));
        dispatch(setResult({}));

        // Sadece yeni round başladığında kelime anlamını al
        getWords(data.word);
      }
    );

    newSocket.on("playerCompleted", (playerId: string) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((player) =>
          player.id === playerId ? { ...player, completed: true } : player
        ),
      }));
    });

    newSocket.on("gameFinished", (finalState: GameState) => {
      setGameState(finalState);
      // Oyun bittiğinde 10 saniye sonra lobby'ye dön
      setTimeout(() => {
        setView("lobby");
        setCurrentRoomId("");
      }, 10000);
    });

    // Oda kapatıldı
    newSocket.on("roomClosed", (message: string) => {
      alert(message);
      setView("lobby");
      setCurrentRoomId("");
      setRoomShareUrl("");
      router.replace("/online", undefined, { shallow: true });
    });

    // Oda kapatma hatası
    newSocket.on("closeRoomError", (error: string) => {
      alert(error);
    });

    return () => {
      newSocket.close();
    };
  }, [username]); // Sadece username değiştiğinde yeniden çalış

  const resetGameState = () => {
    setCurrentAttempts(0);
    setRowOK({
      row1: {
        status: true,
        word: "",
        solves: [],
      },
      row2: {
        status: false,
        word: "",
        solves: [],
      },
      row3: {
        status: false,
        word: "",
        solves: [],
      },
      row4: {
        status: false,
        word: "",
        solves: [],
      },
      row5: {
        status: false,
        word: "",
        solves: [],
      },
      row6: {
        status: false,
        word: "",
        solves: [],
      },
    });
    setRowMeans([]);
  };

  const createRoom = () => {
    if (socket && username.trim() && roomForm.name.trim()) {
      const roomId = uuidv4(); // UUID oluştur
      const userId = uuidv4(); // Kullanıcı ID'si oluştur
      setCurrentUserId(userId);

      socket.emit("createRoom", {
        roomId: roomId, // UUID'yi backend'e gönder
        name: roomForm.name,
        password: roomForm.password || undefined,
        username: username.trim(),
        userId: userId,
        maxPlayers: roomForm.maxPlayers,
        wordCount: roomForm.wordCount,
      });
    }
  };

  const joinRoom = (room: Room) => {
    if (socket && username.trim()) {
      const userId = uuidv4();
      setCurrentUserId(userId);

      socket.emit("joinRoom", {
        roomId: room.id,
        username: username.trim(),
        userId: userId,
        password: room.hasPassword ? joinPassword : undefined,
      });
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoomId) {
      socket.emit("leaveRoom", { roomId: currentRoomId });
      setView("lobby");
      setCurrentRoomId("");
      setRoomShareUrl("");
      // URL'yi temizle
      router.replace("/online", undefined, { shallow: true });
    }
  };

  const closeRoom = () => {
    if (
      socket &&
      currentRoomId &&
      currentUserId &&
      username === gameState.roomOwner
    ) {
      const confirmed = confirm(
        "Odayı kapatmak istediğinizden emin misiniz?\n\n" +
          "⚠️ Bu işlem geri alınamaz\n" +
          "⚠️ Tüm oyuncular odadan çıkarılacak\n" +
          "⚠️ Oyun verisi kaybolacak"
      );
      if (confirmed) {
        socket.emit("closeRoom", {
          roomId: currentRoomId,
          ownerId: currentUserId,
        });
      }
    } else if (username !== gameState.roomOwner) {
      alert("Sadece oda sahibi odayı kapatabilir!");
    }
  };

  const toggleReady = () => {
    if (socket && currentUserId && currentRoomId) {
      const currentPlayer = gameState.players.find(
        (p) => p.id === currentUserId
      );
      const newReadyState = !currentPlayer?.ready;

      socket.emit("playerReady", {
        roomId: currentRoomId,
        playerId: currentUserId,
        ready: newReadyState,
      });
    }
    setShowMenu(true);
  };

  const copyRoomUrl = () => {
    if (roomShareUrl) {
      navigator.clipboard.writeText(roomShareUrl).then(() => {
        alert("Oda linki kopyalandı!");
      });
    }
  };

  // Kullanıcı adı değiştiğinde form'u güncelle
  useEffect(() => {
    if (username) {
      setRoomForm((prev) => ({
        ...prev,
        name: `${username}'in Odası`,
      }));
    }
  }, [username]);

  // Oyun tamamlandığında sunucuya bildir
  useEffect(() => {
    if (
      socket &&
      currentUserId &&
      currentRoomId &&
      (win === selectWord || win === "fail")
    ) {
      const won = win === selectWord;

      socket.emit("playerCompleted", {
        roomId: currentRoomId,
        playerId: currentUserId,
        attempts: currentAttempts === 0 ? 1 : currentAttempts, // En az 1 deneme yapılmış olmalı
        won: won,
      });
    }
  }, [win, selectWord, currentUserId, currentRoomId, socket, currentAttempts]);

  const handleClickOutside = (event: MouseEvent) => {
    if (!popoverRef.current) return;
    if (
      popoverRef.current &&
      !popoverRef?.current?.contains(event.target as Node)
    ) {
      setShowPopover(false);
    }
  };

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await axios.get("/api/info/me");
        if (res.data?.data?.userName) {
          setUsername(res.data.data.userName);
        } else {
          // API'den kullanıcı adı gelmezse misafir kullanıcı adı
          setUsername("Misafir_" + Math.random().toString(36).substr(2, 5));
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error);
        // Hata durumunda varsayılan kullanıcı adı - JWT hatası normal
        setUsername("Misafir_" + Math.random().toString(36).substr(2, 5));
      }
    };
    getMe();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Kullanıcı adı yüklenirken loading göster
  if (!username) {
    return (
      <div className='flex flex-col justify-center items-center w-full h-screen text-center bg-gray-900'>
        <div className='bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4'>
          <h1 className='text-white text-3xl mb-6'>
            Online Lingomania Yarışması
          </h1>
          <div className='flex justify-center items-center'>
            <Icon
              icon='line-md:loading-loop'
              className='text-white'
              fontSize={48}
            />
            <span className='text-white ml-4'>
              Kullanıcı bilgileri yükleniyor...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Lobby ekranı
  if (view === "lobby") {
    return (
      <div className='w-full h-screen bg-gray-900 p-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-white text-3xl'>Online Lingomania Odaları</h1>
            <div className='flex items-center space-x-4'>
              <span className='text-white'>Hoş geldin, {username}!</span>
              <button
                onClick={() => setShowCreateRoom(true)}
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md'
              >
                <Icon icon='mdi:plus' className='inline mr-2' />
                Oda Oluştur
              </button>
            </div>
          </div>

          {/* Oda listesi */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {rooms.map((room) => (
              <div key={room.id} className='bg-gray-800 p-4 rounded-lg'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='text-white text-lg font-semibold'>
                    {room.name}
                  </h3>
                  {room.hasPassword && (
                    <Icon icon='mdi:lock' className='text-yellow-400' />
                  )}
                </div>
                <div className='text-gray-300 text-sm space-y-1'>
                  <p>Sahip: {room.owner}</p>
                  <p>
                    Oyuncular: {room.currentPlayers}/{room.maxPlayers}
                  </p>
                  <p>Kelime Sayısı: {room.wordCount}</p>
                  <p>
                    Durum:{" "}
                    {room.phase === "waiting"
                      ? "🟡 Bekliyor"
                      : room.phase === "playing"
                      ? "🟢 Oynanıyor"
                      : room.phase === "results"
                      ? "🔵 Sonuçlar"
                      : "🔴 Bitti"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    if (room.hasPassword) {
                      setShowJoinRoom(true);
                    } else {
                      joinRoom(room);
                    }
                  }}
                  disabled={
                    room.currentPlayers >= room.maxPlayers ||
                    room.phase === "finished"
                  }
                  className='mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-md'
                >
                  {room.currentPlayers >= room.maxPlayers ? "Dolu" : "Katıl"}
                </button>
              </div>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className='text-center text-gray-400 mt-12'>
              <Icon
                icon='mdi:gamepad-variant-outline'
                fontSize={64}
                className='mx-auto mb-4'
              />
              <p>Henüz oda yok. İlk odayı sen oluştur!</p>
            </div>
          )}
        </div>

        {/* Oda oluşturma modal */}
        {showCreateRoom && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-gray-800 p-6 rounded-lg max-w-md w-full'>
              <h2 className='text-white text-xl mb-4'>Yeni Oda Oluştur</h2>
              <div className='space-y-4'>
                <div>
                  <label className='text-white block mb-2'>Oda Adı</label>
                  <input
                    type='text'
                    value={roomForm.name}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, name: e.target.value })
                    }
                    className='w-full p-3 rounded-md text-black'
                    placeholder='Odanın adını girin'
                  />
                </div>
                <div>
                  <label className='text-white block mb-2'>
                    Şifre (İsteğe bağlı)
                  </label>
                  <input
                    type='password'
                    value={roomForm.password}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, password: e.target.value })
                    }
                    className='w-full p-3 rounded-md text-black'
                    placeholder='Şifre belirleyin'
                  />
                </div>
                <div>
                  <label className='text-white block mb-2'>
                    Maksimum Oyuncu Sayısı
                  </label>
                  <select
                    value={roomForm.maxPlayers}
                    onChange={(e) =>
                      setRoomForm({
                        ...roomForm,
                        maxPlayers: parseInt(e.target.value),
                      })
                    }
                    className='w-full p-3 rounded-md text-black'
                  >
                    <option value={2}>2 Oyuncu</option>
                    <option value={3}>3 Oyuncu</option>
                    <option value={4}>4 Oyuncu</option>
                    <option value={5}>5 Oyuncu</option>
                    <option value={6}>6 Oyuncu</option>
                  </select>
                </div>
                <div>
                  <label className='text-white block mb-2'>Kelime Sayısı</label>
                  <select
                    value={roomForm.wordCount}
                    onChange={(e) =>
                      setRoomForm({
                        ...roomForm,
                        wordCount: parseInt(e.target.value),
                      })
                    }
                    className='w-full p-3 rounded-md text-black'
                  >
                    <option value={20}>20 Kelime</option>
                    <option value={50}>50 Kelime</option>
                    <option value={100}>100 Kelime</option>
                  </select>
                </div>
              </div>
              <div className='flex space-x-3 mt-6'>
                <button
                  onClick={() => {
                    setShowCreateRoom(false);
                    setRoomForm({
                      name: `${username}'in Odası`,
                      password: "",
                      maxPlayers: 4,
                      wordCount: 20,
                    });
                  }}
                  className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md'
                >
                  İptal
                </button>
                <button
                  onClick={createRoom}
                  disabled={!roomForm.name.trim()}
                  className='flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-md'
                >
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Şifreli odaya katılma modal */}
        {showJoinRoom && selectedRoom && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-gray-800 p-6 rounded-lg max-w-md w-full'>
              <h2 className='text-white text-xl mb-4'>Odaya Katıl</h2>
              <p className='text-gray-300 mb-4'>
                "{selectedRoom.name}" odasına katılmak için şifre girin:
              </p>
              <input
                type='password'
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className='w-full p-3 rounded-md text-black mb-4'
                placeholder='Oda şifresi'
                onKeyPress={(e) => e.key === "Enter" && joinRoom(selectedRoom)}
              />
              <div className='flex space-x-3'>
                <button
                  onClick={() => {
                    setShowJoinRoom(false);
                    setSelectedRoom(null);
                    setJoinPassword("");
                  }}
                  className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md'
                >
                  İptal
                </button>
                <button
                  onClick={() => joinRoom(selectedRoom)}
                  disabled={!joinPassword.trim()}
                  className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-md'
                >
                  Katıl
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Oyun ekranı
  return (
    <div className='flex flex-row w-full h-screen bg-gray-900 relative'>
      {/* Sol panel - Oyuncular ve bilgiler */}
      <div className='hidden md:block w-1/4'>
        <SideMenu
          gameState={gameState}
          roomShareUrl={roomShareUrl}
          copyRoomUrl={copyRoomUrl}
          username={username}
          closeRoom={closeRoom}
          leaveRoom={leaveRoom}
          toggleReady={toggleReady}
          currentUserId={currentUserId}
          width='4/4'
        />
      </div>
      <div className='flex md:hidden absolute top-2 right-4 cursor-pointer bg-green-500 rounded-md p-2 min-w-8 min-h-8 flex items-center justify-center z-50'>
        <Icon
          onClick={() => setShowMenu(!showMenu)}
          icon='ri:menu-fold-2-fill'
          fontSize={32}
          color='white'
          className='text-white hover:text-green-500 z-40'
        />
      </div>
      {!showMenu && (
        <div className='absolute top-0 left-0 w-full bg-black bg-opacity-50 z-30'>
          <SideMenu
            gameState={gameState}
            roomShareUrl={roomShareUrl}
            copyRoomUrl={copyRoomUrl}
            username={username}
            closeRoom={closeRoom}
            leaveRoom={leaveRoom}
            toggleReady={toggleReady}
            currentUserId={currentUserId}
            width='3/4'
          />
        </div>
      )}

      {/* Sağ panel - Oyun alanı */}
      <div className='flex-1 flex flex-col justify-center items-center text-center p-4 relative'>
        {gameState.timeLeft <= 10 && gameState.phase === "playing" && (
          <p className='text-red-300 text-xl font-bold animate-pulse mt-1 absolute top-0 left-0'>
            ⚡ SON {gameState.timeLeft} SANİYE! ⚡
          </p>
        )}
        {gameState.phase === "playing" && (
          <>
            <div className='w-full flex justify-center items-center h-2 mb-4'>
              <p className='text-white text-xl'>
                Kelime: {keyboardWord?.toUpperCase()} ile başlıyor
              </p>
              <p className='text-yellow-400 text-sm ml-4'>
                ({currentAttempts}/6 deneme)
              </p>
            </div>

            <div className='w-[330px] min-h-[390px] md:w-auto md:h-auto'>
              <Row
                keyboardWord={keyboardWord}
                solves={rowOk.row1?.solves ? rowOk.row1.solves : []}
                means={rowMeans[0] ? rowMeans[0] : []}
                isOk={rowOk.row1.status}
                word={rowOk.row1.word}
              />
              <Row
                keyboardWord={keyboardWord}
                solves={rowOk?.row2.solves ? rowOk.row2.solves : []}
                means={rowMeans[1] ? rowMeans[1] : []}
                isOk={rowOk.row2.status}
                word={rowOk.row2.word}
              />
              <Row
                keyboardWord={keyboardWord}
                solves={rowOk?.row3.solves ? rowOk.row3.solves : []}
                means={rowMeans[2] ? rowMeans[2] : []}
                isOk={rowOk.row3.status}
                word={rowOk.row3.word}
              />
              <Row
                keyboardWord={keyboardWord}
                solves={rowOk?.row4.solves ? rowOk.row4.solves : []}
                means={rowMeans[3] ? rowMeans[3] : []}
                isOk={rowOk.row4.status}
                word={rowOk.row4.word}
              />
              <Row
                keyboardWord={keyboardWord}
                solves={rowOk?.row5.solves ? rowOk.row5.solves : []}
                means={rowMeans[4] ? rowMeans[4] : []}
                isOk={rowOk.row5.status}
                word={rowOk.row5.word}
              />
              <Row
                keyboardWord={keyboardWord}
                solves={rowOk?.row6.solves ? rowOk.row6.solves : []}
                means={rowMeans[5] ? rowMeans[5] : []}
                isOk={rowOk.row6.status}
                word={rowOk.row6.word}
              />
            </div>

            {win !== selectWord && win !== "fail" && gameState.timeLeft > 0 && (
              <Keyboard
                setKeyboardWord={setKeyboardWord}
                rowOk={rowOk}
                setRowOK={setRowOK}
                keyboardWord={keyboardWord}
                setRowMeans={setRowMeans}
                currentAttempts={currentAttempts}
                setCurrentAttempts={setCurrentAttempts}
              />
            )}

            {win === selectWord && (
              <div className='text-white mb-4'>
                <p className='text-white text-2xl my-4'>Bildiniz! Tebrikler!</p>
                <p className='text-green-400'>
                  Diğer oyuncuları bekliyorsunuz...
                </p>
              </div>
            )}

            {(win === "fail" || gameState.timeLeft === 0) && (
              <div className='text-white mb-4 flex flex-col items-center'>
                <p className='text-white text-2xl my-2'>
                  {win === "fail" ? "Bilemediniz." : "Süre bitti!"}
                </p>
                <p className='text-white text-2xl my-2 flex items-center'>
                  Kelime:{" "}
                </p>
                <div className='text-white my-2 flex items-center'>
                  <p className='text-2xl uppercase'>{selectWord}</p>
                  {result && (
                    <div className='ml-4 rounded-full bg-green-600 hover:bg-green-800 p-2 cursor-pointer relative'>
                      <Icon
                        icon='akar-icons:chat-question'
                        fontSize={32}
                        onClick={() => setShowPopover(!showPopover)}
                      />
                      {showPopover && (
                        <div
                          ref={popoverRef}
                          className='absolute bottom-16 md:bottom-10 -left-32 md:left-10 min-w-[300px] max-h-[400px] p-4 rounded-xl md:rounded-bl-none shadow-md shadow-black bg-slate-600 overflow-y-auto'
                        >
                          <p className='flex flex-col uppercase border-b mb-2'>
                            {selectWord}: {result.lisan}
                          </p>
                          <div>
                            <ul>
                              {result?.means?.map(
                                (
                                  item: { anlam: string; madde_id: string },
                                  index: number
                                ) => {
                                  return (
                                    <li
                                      className='text-start text-sm list-disc ml-4 mb-2'
                                      key={item.madde_id + index}
                                    >
                                      {item.anlam}
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className='text-yellow-400'>
                  Diğer oyuncuları bekliyorsunuz...
                </p>
              </div>
            )}
          </>
        )}

        {gameState.phase === "results" && (
          <div className='text-white text-center'>
            <h2 className='text-3xl mb-4'>
              Round {gameState.roundNumber} Sonuçları
            </h2>
            <div className='mb-4'>
              <p className='text-xl'>
                Kelime:{" "}
                <span className='uppercase font-bold'>{selectWord}</span>
              </p>
            </div>
            <p className='text-lg'>
              Yeni round {gameState.timeLeft} saniye içinde başlıyor...
            </p>
          </div>
        )}

        {gameState.phase === "waiting" && (
          <div className='text-white text-center'>
            <h2 className='text-3xl mb-4'>Oyun Başlamak İçin Hazır Olun!</h2>
            <div className='mb-6'>
              <p className='text-xl mb-2'>
                Hazır Oyuncular:{" "}
                {gameState.players.filter((p) => p.ready).length} /{" "}
                {gameState.players.length}
              </p>
              <div className='bg-gray-800 p-4 rounded-lg max-w-md mx-auto'>
                <p className='text-lg mb-2'>Oyuncular:</p>
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className='flex justify-between items-center mb-1'
                  >
                    <span>{player.username}</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        player.ready ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {player.ready ? "✓ Hazır" : "✗ Bekliyor"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {gameState.players.filter((p) => p.ready).length ===
              gameState.players.length && gameState.players.length > 0 ? (
              <div>
                <Icon
                  icon='line-md:loading-loop'
                  className='mx-auto mb-2'
                  fontSize={48}
                />
                <p className='text-lg'>Oyun başlıyor...</p>
              </div>
            ) : (
              <p className='text-lg'>Tüm oyuncuların hazır olmasını bekleyin</p>
            )}
          </div>
        )}

        {gameState.phase === "finished" && (
          <div className='text-white text-center'>
            <h2 className='text-4xl mb-6'>🎉 Oyun Bitti! 🎉</h2>
            <div className='bg-gray-800 p-6 rounded-lg max-w-md mx-auto'>
              <h3 className='text-2xl mb-4'>Final Sıralaması</h3>
              <div className='space-y-2'>
                {gameState.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded flex justify-between ${
                        index === 0
                          ? "bg-yellow-600"
                          : index === 1
                          ? "bg-gray-500"
                          : index === 2
                          ? "bg-orange-600"
                          : "bg-gray-700"
                      }`}
                    >
                      <span>
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `${index + 1}.`}{" "}
                        {player.username}
                      </span>
                      <span className='font-bold'>{player.score} puan</span>
                    </div>
                  ))}
              </div>
            </div>
            <p className='text-lg mt-6'>
              10 saniye sonra lobby'ye dönülecek...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Online;

const SideMenu = ({
  gameState,
  roomShareUrl,
  copyRoomUrl,
  username,
  closeRoom,
  leaveRoom,
  toggleReady,
  currentUserId,
  width = "1/4",
}: {
  gameState: GameState;
  roomShareUrl: string;
  copyRoomUrl: () => void;
  username: string;
  closeRoom: () => void;
  leaveRoom: () => void;
  toggleReady: () => void;
  currentUserId: string;
  width?: string;
}) => {
  return (
    <div className={`w-${width} h-screen bg-gray-800 p-4 border-r border-gray-700`}>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex space-x-2'>
          {roomShareUrl && (
            <button
              onClick={copyRoomUrl}
              className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm'
              title='Oda linkini kopyala'
            >
              <Icon icon='mdi:share' />
            </button>
          )}
          {/* Oda sahibine özel kapatma düğmesi */}
          {username === gameState.roomOwner && (
            <button
              onClick={closeRoom}
              className='bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm'
              title='Odayı kapat'
            >
              <Icon icon='mdi:close-circle' />
            </button>
          )}
          <button
            onClick={leaveRoom}
            className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm'
          >
            Çık
          </button>
        </div>
      </div>

      {/* Oyun durumu */}
      <div className='mb-4 p-3 bg-gray-700 rounded'>
        <div className='text-white text-sm'>
          <p>Round: {gameState.roundNumber}</p>
          <p>
            Oda Sahibi:{" "}
            <span className='text-yellow-400'>{gameState.roomOwner}</span>
            {username === gameState.roomOwner && (
              <span className='text-green-400 ml-1'>(Sen)</span>
            )}
          </p>
          <p>
            Durum:{" "}
            {gameState.phase === "playing"
              ? "Oynanıyor"
              : gameState.phase === "waiting"
              ? "Bekliyor"
              : gameState.phase === "results"
              ? "Sonuçlar"
              : "Bitti"}
          </p>
          <div
            className={`relative transition-all duration-300 ${
              gameState.timeLeft <= 10 && gameState.phase === "playing"
                ? "transform scale-105 animate-pulse"
                : ""
            }`}
          >
            {/* Circular Progress Bar Border */}
            <div className='relative p-4'>
              <svg
                className='absolute inset-0 w-full h-full -rotate-90'
                viewBox='0 0 100 100'
                style={{ filter: "drop-shadow(0 0 8px rgba(0, 255, 0, 0.5))" }}
              >
                {/* Background circle */}
                <circle
                  cx='50'
                  cy='50'
                  r='45'
                  fill='none'
                  stroke='rgba(75, 85, 99, 0.3)'
                  strokeWidth='2'
                />
                {/* Progress circle */}
                <circle
                  cx='50'
                  cy='50'
                  r='45'
                  fill='none'
                  stroke={
                    gameState.timeLeft <= 10 && gameState.phase === "playing"
                      ? "#ef4444"
                      : "#10b981"
                  }
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${
                    2 *
                    Math.PI *
                    45 *
                    (1 - gameState.timeLeft / gameState.totalTime)
                  }`}
                  style={{
                    transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
                    filter:
                      gameState.timeLeft <= 10 && gameState.phase === "playing"
                        ? "drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))"
                        : "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))",
                  }}
                />
              </svg>

              {/* Timer content */}
              <div className='relative z-10'>
                <p
                  className={`font-bold text-center ${
                    gameState.timeLeft <= 10 && gameState.phase === "playing"
                      ? "text-2xl text-red-400 animate-bounce"
                      : "text-lg text-white"
                  }`}
                >
                  <span
                    className={
                      gameState.timeLeft <= 10 && gameState.phase === "playing"
                        ? "text-red-300 font-extrabold text-4xl"
                        : "text-yellow-400"
                    }
                  >
                    {formatTime(gameState.timeLeft)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Oyuncu listesi */}
      <div className='space-y-2'>
        <h2 className='text-white text-xl'>Online Oyuncular</h2>
        {gameState.players
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <div
              key={player.id}
              className={`p-3 rounded ${
                player.username === username ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <div className='text-white'>
                <div className='flex justify-between items-center'>
                  <span className='font-semibold'>
                    #{index + 1} {player.username}
                    {player.username === username && " (Sen)"}
                  </span>
                  <div className='flex items-center space-x-2'>
                    {gameState.phase === "waiting" && (
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          player.ready ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {player.ready ? "✓ Hazır" : "✗ Bekliyor"}
                      </span>
                    )}
                    {player.completed && gameState.phase === "playing" && (
                      <Icon
                        icon='mdi:check-circle'
                        className='text-green-400'
                      />
                    )}
                  </div>
                </div>
                <div className='text-sm text-gray-300'>
                  Puan:{" "}
                  <span className='font-bold text-yellow-400'>
                    {player.score}
                  </span>
                  {player.attempts > 0 && (
                    <span className='text-xs ml-2'>
                      ({player.attempts} deneme)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {gameState.phase === "waiting" && (
        <div className='mt-4 p-4 bg-yellow-600 rounded text-white text-center'>
          <p className='mb-3 text-lg font-semibold'>
            🎮 Oyun Başlamak İçin Hazır Olun!
          </p>

          {/* Ready durumu göstergesi */}
          <div className='mb-4'>
            <p className='text-sm mb-2'>
              Hazır oyuncular:{" "}
              <span className='font-bold'>
                {gameState.players.filter((p) => p.ready).length} /{" "}
                {gameState.players.length}
              </span>
            </p>
            <div className='bg-yellow-700 rounded p-2'>
              <p className='text-xs'>
                {gameState.players.filter((p) => p.ready).length ===
                  gameState.players.length && gameState.players.length > 0
                  ? "✅ Tüm oyuncular hazır! Oyun başlıyor..."
                  : "⏳ Tüm oyuncuların hazır olmasını bekleyin"}
              </p>
            </div>
          </div>

          {/* Start düğmesi */}
          <button
            onClick={toggleReady}
            disabled={
              gameState.players.filter((p) => p.ready).length ===
                gameState.players.length && gameState.players.length > 0
            }
            className={`px-8 py-3 rounded-md font-bold text-lg transition-colors ${
              gameState.players.find((p) => p.id === currentUserId)?.ready
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            } ${
              gameState.players.filter((p) => p.ready).length ===
                gameState.players.length && gameState.players.length > 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {gameState.players.find((p) => p.id === currentUserId)?.ready
              ? "❌ Hazır Değilim"
              : "✅ Hazırım!"}
          </button>

          {gameState.players.filter((p) => p.ready).length ===
            gameState.players.length &&
            gameState.players.length > 0 && (
              <div className='mt-4'>
                <Icon
                  icon='line-md:loading-loop'
                  className='mx-auto'
                  fontSize={32}
                />
                <p className='text-sm mt-2 font-semibold'>
                  🚀 Oyun başlıyor...
                </p>
              </div>
            )}
        </div>
      )}

      {gameState.phase === "finished" && (
        <div className='mt-4 p-3 bg-purple-600 rounded text-white text-center'>
          <p>🎉 Oyun Bitti!</p>
          <p className='text-sm mt-1'>10 saniye sonra lobby'ye dönülecek</p>
        </div>
      )}
    </div>
  );
};
