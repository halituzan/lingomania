const randomLetter = () => {
    // Türkçe harfleri içeren bir dizi oluştur
    var turkceHarfler = ['a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h', 'ı', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'ö', 'p', 'r', 's', 'ş', 't', 'u', 'ü', 'v', 'y', 'z'];

    // Rastgele bir indeks seç
    var rastgeleIndex = Math.floor(Math.random() * turkceHarfler.length);

    // Seçilen indeksteki harfi döndür
    return turkceHarfler[rastgeleIndex];
}

export default randomLetter