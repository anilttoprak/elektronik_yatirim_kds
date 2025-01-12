-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1:3306
-- Üretim Zamanı: 12 Oca 2025, 16:17:22
-- Sunucu sürümü: 8.3.0
-- PHP Sürümü: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `elektronik_sirket`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `kullanicilar`
--

DROP TABLE IF EXISTS `kullanicilar`;
CREATE TABLE IF NOT EXISTS `kullanicilar` (
  `kullanici_id` int NOT NULL AUTO_INCREMENT,
  `kullanici_adi` varchar(255) COLLATE utf8mb3_turkish_ci NOT NULL,
  `sifre` varchar(255) COLLATE utf8mb3_turkish_ci NOT NULL,
  PRIMARY KEY (`kullanici_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_turkish_ci;

--
-- Tablo döküm verisi `kullanicilar`
--

INSERT INTO `kullanicilar` (`kullanici_id`, `kullanici_adi`, `sifre`) VALUES
(1, 'anil', '12345'),
(2, 'admin', 'admin');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `satis_kayitlari`
--

DROP TABLE IF EXISTS `satis_kayitlari`;
CREATE TABLE IF NOT EXISTS `satis_kayitlari` (
  `kayit_id` int NOT NULL AUTO_INCREMENT,
  `urun_id` int NOT NULL,
  `yil` int DEFAULT NULL,
  `toplam_gelir` float DEFAULT NULL,
  `toplam_gider` float DEFAULT NULL,
  `satilan_miktar` int DEFAULT NULL,
  PRIMARY KEY (`kayit_id`),
  KEY `urun_id` (`urun_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_turkish_ci;

--
-- Tablo döküm verisi `satis_kayitlari`
--

INSERT INTO `satis_kayitlari` (`kayit_id`, `urun_id`, `yil`, `toplam_gelir`, `toplam_gider`, `satilan_miktar`) VALUES
(1, 1, 2019, 94932, 60600, 81),
(2, 1, 2020, 259407, 197264, 205),
(3, 1, 2021, 378453, 228303, 73),
(4, 1, 2022, 73917, 58639, 43),
(5, 1, 2023, 298901, 221515, 94),
(6, 2, 2019, 65921, 42500, 75),
(7, 2, 2020, 125430, 98340, 130),
(8, 2, 2021, 139890, 89300, 92),
(9, 2, 2022, 53321, 42900, 48),
(10, 2, 2023, 109430, 82000, 85),
(11, 3, 2019, 112341, 79230, 54),
(12, 3, 2020, 302540, 229430, 124),
(13, 3, 2021, 276310, 190000, 73),
(14, 3, 2022, 102340, 85230, 33),
(15, 3, 2023, 198340, 153200, 67),
(16, 4, 2019, 205540, 153320, 84),
(17, 4, 2020, 185430, 149330, 76),
(18, 4, 2021, 214300, 162540, 82),
(19, 4, 2022, 179540, 142430, 58),
(20, 4, 2023, 230430, 178500, 91),
(21, 5, 2019, 183420, 138400, 69),
(22, 5, 2020, 159540, 125300, 54),
(23, 5, 2021, 175630, 132300, 63),
(24, 5, 2022, 143530, 114200, 47),
(25, 5, 2023, 198540, 145200, 72),
(26, 6, 2019, 225540, 178320, 75),
(27, 6, 2020, 198530, 155300, 63),
(28, 6, 2021, 215430, 162540, 68),
(29, 6, 2022, 187430, 149320, 59),
(30, 6, 2023, 243540, 189540, 88),
(31, 7, 2019, 84530, 54200, 95),
(32, 7, 2020, 123430, 89200, 112),
(33, 7, 2021, 135300, 93200, 98),
(34, 7, 2022, 95430, 74200, 75),
(35, 7, 2023, 143540, 108300, 103),
(36, 8, 2019, 165430, 129300, 63),
(37, 8, 2020, 175320, 136400, 68),
(38, 8, 2021, 198540, 145200, 72),
(39, 8, 2022, 143230, 112400, 54),
(40, 8, 2023, 203540, 152300, 80),
(41, 9, 2019, 94230, 67200, 85),
(42, 9, 2020, 325430, 252300, 205),
(43, 9, 2021, 295430, 198320, 123),
(44, 9, 2022, 175430, 152300, 67),
(45, 9, 2023, 243540, 198500, 98),
(46, 10, 2019, 270000, 250000, 104),
(47, 10, 2020, 250000, 240000, 95),
(48, 10, 2021, 220000, 250000, 90);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `urunler`
--

DROP TABLE IF EXISTS `urunler`;
CREATE TABLE IF NOT EXISTS `urunler` (
  `urun_id` int NOT NULL AUTO_INCREMENT,
  `ad` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_turkish_ci NOT NULL,
  `kategori` varchar(50) COLLATE utf8mb3_turkish_ci DEFAULT NULL,
  PRIMARY KEY (`urun_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_turkish_ci;

--
-- Tablo döküm verisi `urunler`
--

INSERT INTO `urunler` (`urun_id`, `ad`, `kategori`) VALUES
(1, 'Televizyon', 'Elektronik'),
(2, 'Hoparlör', 'Elektronik'),
(3, 'Projeksiyon', 'Elektronik'),
(4, 'Buzdolabı', 'Beyaz Eşya'),
(5, 'Bulaşık Makinesi', 'Beyaz Eşya'),
(6, 'Çamaşır Makinesi', 'Beyaz Eşya'),
(7, 'Elektrikli Süpürge', 'Beyaz Eşya'),
(8, 'Klima', 'Beyaz Eşya'),
(9, 'Monitör', 'Elektronik'),
(10, 'Telefon', 'Elektronik');

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `satis_kayitlari`
--
ALTER TABLE `satis_kayitlari`
  ADD CONSTRAINT `satis_kayitlari_ibfk_1` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`urun_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
