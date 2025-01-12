const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const session = require("express-session");
const db = require('./data/db');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "gizli_anahtar",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);


app.get("/", (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }
  res.redirect("/index.html");
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.post("/login", (req, res) => {
  const { kullanici_adi, sifre } = req.body;

  const query = "SELECT * FROM kullanicilar WHERE kullanici_adi = ? AND sifre = ?";
  db.query(query, [kullanici_adi, sifre], (err, results) => {
    if (err) {
      console.error("Veritabanı sorgusunda hata:", err);
      return res.status(500).send({ message: "Sunucu hatası!" });
    }

    if (results.length > 0) {
      req.session.loggedIn = true; 
      req.session.kullaniciAdi = results[0].kullanici_adi;
      return res.status(200).send({ message: "Giriş başarılı!" });
    } else {
      return res.status(401).send({ message: "Geçersiz kullanıcı adı veya şifre!" });
    }
  });
});

app.get('/get-kullanici-adi', (req, res) => {
  if (req.session.loggedIn) {
    res.json({ kullaniciAdi: req.session.kullaniciAdi });
  } else {
    res.status(401).send('Kullanıcı girişi yapılmamış.');
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Çıkış sırasında bir hata oluştu:', err);
      return res.status(500).send('Çıkış yapılamadı. Lütfen tekrar deneyin.');
    }
    res.redirect('/login');
  });
});


app.get("/index.html", (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login.html");
  }
  res.sendFile(__dirname + "/public/index.html");
});

app.get('/api/ozet', (req, res) => {
  // En Karlı Ürün
  const query1 = `
    SELECT
      urunler.ad AS en_karli_urun,
      (satis_kayitlari.toplam_gelir - satis_kayitlari.toplam_gider) AS kar
    FROM satis_kayitlari
    JOIN urunler ON urunler.urun_id = satis_kayitlari.urun_id
    WHERE satis_kayitlari.yil = 2023
    ORDER BY kar DESC
    LIMIT 1;
  `;

  // En Karsız Ürün
  const query2 = `
    SELECT
      urunler.ad AS en_karsiz_urun,
      (satis_kayitlari.toplam_gelir - satis_kayitlari.toplam_gider) AS kar
    FROM satis_kayitlari
    JOIN urunler ON urunler.urun_id = satis_kayitlari.urun_id
    WHERE satis_kayitlari.yil = 2023
    ORDER BY kar ASC
    LIMIT 1;
  `;

  // En Çok Satılan Ürün
  const query3 = `
    SELECT
      urunler.ad AS en_cok_satilan_urun,
      satis_kayitlari.satilan_miktar AS toplam_satis
    FROM satis_kayitlari
    JOIN urunler ON urunler.urun_id = satis_kayitlari.urun_id
    WHERE satis_kayitlari.yil = 2023
    GROUP BY urunler.ad
    ORDER BY toplam_satis DESC
    LIMIT 1;
  `;

  // Toplam Gelir, Gider ve Kar
  const query4 = `
    SELECT
      SUM(toplam_gelir) AS toplam_gelir,
      SUM(toplam_gider) AS toplam_gider,
      SUM(toplam_gelir - toplam_gider) AS toplam_kar
    FROM satis_kayitlari
    WHERE satis_kayitlari.yil = 2023;
  `;
  db.query(query1, (err, results1) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).send('Sunucu hatası');
    }

    db.query(query2, (err, results2) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).send('Sunucu hatası');
      }

      db.query(query3, (err, results3) => {
        if (err) {
          console.error('Veritabanı hatası:', err);
          return res.status(500).send('Sunucu hatası');
        }

        db.query(query4, (err, results4) => {
          if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Sunucu hatası');
          }
          res.json({
            en_karli_urun: results1[0]?.en_karli_urun || 'Veri Yok',
            en_karsiz_urun: results2[0]?.en_karsiz_urun || 'Veri Yok',
            en_cok_satilan_urun: results3[0]?.en_cok_satilan_urun || 'Veri Yok',
            toplam_gelir: results4[0]?.toplam_gelir || 0,
            toplam_gider: results4[0]?.toplam_gider || 0,
            toplam_kar: results4[0]?.toplam_kar || 0
          });
        });
      });
    });
  });
});

app.get('/api/gelir-gider', (req, res) => {
  const yil = req.query.yil;
  const sql = `
      SELECT 
          yil,
          SUM(toplam_gelir) AS toplam_gelir, 
          SUM(toplam_gider) AS toplam_gider, 
          SUM(toplam_gelir) - SUM(toplam_gider) AS toplam_kar
      FROM satis_kayitlari
      WHERE yil = ?
      GROUP BY yil;
  `;

  db.query(sql, [yil], (err, results) => {
    if (err) {
      console.error('SQL hatası:', err);
      return res.status(500).send('Veri alınırken bir hata oluştu.');
    }

    if (results.length > 0) {
      const response = {
        gelir: results[0].toplam_gelir || 0,
        gider: results[0].toplam_gider || 0,
        kar: results[0].toplam_kar || 0,
      };
      res.json(response);
    } else {
      res.json({ gelir: 0, gider: 0, kar: 0 });
    }
  });
});

app.get("/api/urunler", (req, res) => {
  const yil = req.query.yil || 2023;
  const sql = `
      SELECT u.ad AS urun_adi, 
             SUM(s.toplam_gelir) AS toplam_gelir, 
             SUM(s.toplam_gider) AS toplam_gider
      FROM urunler u
      JOIN satis_kayitlari s ON u.urun_id = s.urun_id
      WHERE s.yil = ?
      GROUP BY u.ad
  `;
  db.query(sql, [yil], (err, results) => {
    if (err) {
      console.error("Sorgu sırasında hata oluştu:", err);
      res.status(500).send("Sunucu hatası.");
    } else {
      res.json(results);
    }
  });
});


app.get("/api/satisMiktarlari", (req, res) => {
  const yil = req.query.yil || 2023;
  const sql = `
      SELECT u.ad AS urun_adi, 
             s.satilan_miktar AS toplam_satilan_miktar
      FROM urunler u
      JOIN satis_kayitlari s ON u.urun_id = s.urun_id
      WHERE s.yil = ?
      GROUP BY u.ad
      ORDER BY toplam_satilan_miktar DESC;
  `;

  db.query(sql, [yil], (err, results) => {
    if (err) {
      console.error("Sorgu sırasında hata oluştu:", err);
      res.status(500).send("Sunucu hatası.");
    } else {
      res.json(results);
    }
  });
});

app.get("/api/kategoriKarYuzdeleri", (req, res) => {
  const yil = req.query.yil || "2023";
  const sql = `
      SELECT urunler.kategori, 
             (SUM(satis_kayitlari.toplam_gelir - satis_kayitlari.toplam_gider) / 
             (SELECT SUM(toplam_gelir - toplam_gider) 
              FROM satis_kayitlari 
              WHERE yil = ?)) * 100 AS kar_yuzdesi
      FROM satis_kayitlari
      JOIN urunler ON satis_kayitlari.urun_id = urunler.urun_id
      WHERE satis_kayitlari.yil = ?
      GROUP BY urunler.kategori;
  `;

  db.query(sql, [yil, yil], (err, results) => {
    if (err) {
      console.error("Sorgu sırasında hata oluştu:", err);
      res.status(500).send("Sunucu hatası.");
    } else {
      res.json(results);
    }
  });
});

app.get('/api/ozet-tahmin', (req, res) => {
  // En Karlı Ürün
  const query1 = `
    SELECT 
      u.ad AS urun_adi,
      ROUND((sk2023.toplam_gelir - sk2023.toplam_gider) * 
            (1 + ((sk2023.toplam_gelir - sk2023.toplam_gider) - (sk2022.toplam_gelir - sk2022.toplam_gider)) / (sk2022.toplam_gelir - sk2022.toplam_gider)), 0) AS tahmini_kar
    FROM satis_kayitlari sk2023
    JOIN satis_kayitlari sk2022 ON sk2023.urun_id = sk2022.urun_id
    JOIN urunler u ON sk2023.urun_id = u.urun_id
    WHERE sk2023.yil = 2023 AND sk2022.yil = 2022
    ORDER BY tahmini_kar DESC
    LIMIT 1;
  `;

  // En Karsız Ürün
  const query2 = `
    SELECT 
      u.ad AS urun_adi,
      ROUND((sk2023.toplam_gelir - sk2023.toplam_gider) * 
            (1 + ((sk2023.toplam_gelir - sk2023.toplam_gider) - (sk2022.toplam_gelir - sk2022.toplam_gider)) / (sk2022.toplam_gelir - sk2022.toplam_gider)), 0) AS tahmini_kar
    FROM satis_kayitlari sk2023
    JOIN satis_kayitlari sk2022 ON sk2023.urun_id = sk2022.urun_id
    JOIN urunler u ON sk2023.urun_id = u.urun_id
    WHERE sk2023.yil = 2023 AND sk2022.yil = 2022
    ORDER BY tahmini_kar ASC
    LIMIT 1;
  `;

  // En Çok Satılan Ürün
  const query3 = `
    SELECT 
      u.ad AS urun_adi,
      ROUND(sk2023.satilan_miktar * 
            (1 + ((sk2023.satilan_miktar - sk2022.satilan_miktar) / sk2022.satilan_miktar)), 0) AS tahmini_satis
    FROM satis_kayitlari sk2023
    JOIN satis_kayitlari sk2022 ON sk2023.urun_id = sk2022.urun_id
    JOIN urunler u ON sk2023.urun_id = u.urun_id
    WHERE sk2023.yil = 2023 AND sk2022.yil = 2022
    ORDER BY tahmini_satis DESC
    LIMIT 1;
  `;

  // Toplam Gelir, Gider ve Kar
  const query4 = `
    SELECT 
      ROUND(SUM(sk2023.toplam_gelir) * 
            (1 + ((SUM(sk2023.toplam_gelir) - SUM(sk2022.toplam_gelir)) / SUM(sk2022.toplam_gelir))), 0) AS tahmini_gelir,
      ROUND(SUM(sk2023.toplam_gider) * 
            (1 + ((SUM(sk2023.toplam_gider) - SUM(sk2022.toplam_gider)) / SUM(sk2022.toplam_gider))), 0) AS tahmini_gider,
      ROUND((SUM(sk2023.toplam_gelir) - SUM(sk2023.toplam_gider)) * 
            (1 + ((SUM(sk2023.toplam_gelir) - SUM(sk2023.toplam_gider)) - (SUM(sk2022.toplam_gelir) - SUM(sk2022.toplam_gider))) / (SUM(sk2022.toplam_gelir) - SUM(sk2022.toplam_gider))), 0) AS tahmini_kar
    FROM satis_kayitlari sk2023
    JOIN satis_kayitlari sk2022 ON sk2023.urun_id = sk2022.urun_id
    WHERE sk2023.yil = 2023 AND sk2022.yil = 2022;
  `;
  db.query(query1, (err, results1) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).send('Sunucu hatası');
    }

    db.query(query2, (err, results2) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).send('Sunucu hatası');
      }

      db.query(query3, (err, results3) => {
        if (err) {
          console.error('Veritabanı hatası:', err);
          return res.status(500).send('Sunucu hatası');
        }

        db.query(query4, (err, results4) => {
          if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Sunucu hatası');
          }
          res.json({
            en_karli_urun_2025: results1.length > 0 ? results1[0].urun_adi : 'Veri Yok',
            en_karsiz_urun_2025: results2.length > 0 ? results2[0].urun_adi : 'Veri Yok',
            en_cok_satilan_urun_2025: results3.length > 0 ? results3[0].urun_adi : 'Veri Yok',
            toplam_gelir_2025: results4.length > 0 ? results4[0].tahmini_gelir : 0,
            toplam_gider_2025: results4.length > 0 ? results4[0].tahmini_gider : 0,
            toplam_kar_2025: results4.length > 0 ? results4[0].tahmini_kar : 0
          });
        });
      });
    });
  });
});

app.get("/api/tahmin-urunler", (req,res) => {
  const sql = `
  SELECT 
    u.ad AS urun_adi,
    ROUND((sk2023.toplam_gelir - sk2023.toplam_gider) * 
          (1 + ((sk2023.toplam_gelir - sk2023.toplam_gider) - (sk2022.toplam_gelir - sk2022.toplam_gider)) / (sk2022.toplam_gelir - sk2022.toplam_gider)), 0) AS tahmini_kar_2024
FROM satis_kayitlari sk2023
JOIN satis_kayitlari sk2022 ON sk2023.urun_id = sk2022.urun_id
JOIN urunler u ON sk2023.urun_id = u.urun_id
WHERE sk2023.yil = 2023 AND sk2022.yil = 2022
ORDER BY tahmini_kar_2024 DESC;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Sorgu sırasında hata oluştu:", err);
      res.status(500).send("Sunucu hatası.");
    } else {
      res.json(results);
    }
  });
});

app.get("/api/tahmin-satisMiktarlari", (req, res) => {
  const sql = `
  SELECT 
      u.ad AS urun_adi,
      ROUND(sk2023.satilan_miktar * 
            (1 + ((sk2023.satilan_miktar - sk2022.satilan_miktar) / sk2022.satilan_miktar)), 0) AS tahmini_satis
    FROM satis_kayitlari sk2023
    JOIN satis_kayitlari sk2022 ON sk2023.urun_id = sk2022.urun_id
    JOIN urunler u ON sk2023.urun_id = u.urun_id
    WHERE sk2023.yil = 2023 AND sk2022.yil = 2022
    ORDER BY tahmini_satis DESC
  `;
  db.query(sql,(err, results) => {
    if (err) {
      console.error("Sorgu sırasında hata oluştu:", err);
      res.status(500).send("Sunucu hatası.");
    } else {
      res.json(results);
    }
  });
});

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});