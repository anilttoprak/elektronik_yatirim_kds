// kullanıcı adı şifre alma
document.addEventListener('DOMContentLoaded', function () {
    fetch('/get-kullanici-adi', {
        method: 'GET',
        credentials: 'same-origin' 
    })
        .then(response => {
            if (response.status === 401 && !window.location.href.includes('login')) {
                window.location.href = '/login';
                return;
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('welcome-message').textContent = `Hoşgeldiniz,${data.kullaniciAdi}`;
        })
        .catch(error => {
            console.error('Hata:', error);
        });
});

// responsive menü 
function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("sidebar-hidden");
    sidebar.classList.add("sidebar-responsive");
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("sidebar-responsive");
    sidebar.classList.add("sidebar-hidden");
}

// login kısmı
document.addEventListener("DOMContentLoaded", () => {
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const kullaniciAdi = document.getElementById("kullaniciAdi").value;
        const sifre = document.getElementById("sifre").value;
        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ kullanici_adi: kullaniciAdi, sifre }),
            });
            const result = await response.json();
            const errorMessage = document.getElementById("errorMessage");
            if (response.status === 200) {
                window.location.href = "/index.html";
            } else {
                errorMessage.textContent = result.message;
                errorMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Giriş işlemi sırasında bir hata oluştu:", error);
            const errorMessage = document.getElementById("errorMessage");
            errorMessage.textContent = "Bir hata oluştu. Lütfen tekrar deneyin.";
            errorMessage.style.display = "block";
        }
    });
}
});

// anasayfa özet
document.addEventListener("DOMContentLoaded", () => {
fetch('/api/ozet')
    .then(response => response.json())
    .then(data => {
        document.getElementById('en-karli-urun-veri').textContent = data.en_karli_urun || 'Veri Yok';
        document.getElementById('en-karsiz-urun-veri').textContent = data.en_karsiz_urun || 'Veri Yok';
        document.getElementById('en-cok-satilan-urun-veri').textContent = data.en_cok_satilan_urun || 'Veri Yok';
        document.getElementById('toplam-gelir').textContent = `Gelir: ₺${data.toplam_gelir || 0}`;
        document.getElementById('toplam-gider').textContent = `Gider: ₺${data.toplam_gider || 0}`;
        document.getElementById('toplam-kar-veri').textContent = `Net Kâr: ₺${data.toplam_kar || 0}`;
    })
    .catch(error => {
        console.error('API Hatası:', error);
    });
});

// ilk grafik
document.addEventListener('DOMContentLoaded', () => {
    const yilSecimi = document.getElementById('yilSecim');
    const ctx = document.getElementById('finansalGrafik').getContext('2d');
    let grafik = null;

    yilGuncelle(yilSecimi.value);
    yilSecimi.addEventListener('change', (event) => {
        const secilenYil = event.target.value;
        yilGuncelle(secilenYil);
    });

    function yilGuncelle(yil) {
        fetch(`/api/gelir-gider?yil=${yil}`)
            .then((response) => response.json())
            .then((data) => {
                const { gelir, gider, kar } = data;
                if (grafik) {
                    grafik.destroy();
                }
                grafik = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Gelir', 'Gider', 'Kâr'],
                        datasets: [
                            {
                                label: `${yil} Yılı`,
                                data: [gelir, gider, kar],
                                backgroundColor: [
                                    'rgba(0, 128, 0, 0.7)', 
                                    'rgba(255, 0, 0, 0.7)',
                                    'rgba(0, 0, 255, 0.7)', 
                                ],
                                borderColor: [
                                    'rgba(0, 128, 0, 1)',
                                    'rgba(255, 0, 0, 1)',
                                    'rgba(0, 0, 255, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    },
                });
            })
            .catch((error) => {
                console.error('API Hatası:', error);
            });
    }
});

// ikinci grafik
document.addEventListener("DOMContentLoaded", () => {
    const yilSecimi = document.getElementById("yilSecim2");
    const ctx = document.getElementById("urunlerGrafik").getContext("2d");

    let myChart;

    const fetchDataAndRenderChart = (yil) => {
        fetch(`/api/urunler?yil=${yil}`)
            .then(response => response.json())
            .then(data => {
                if (myChart) {
                    myChart.destroy();
                }

                const urunAdlari = data.map(item => item.urun_adi);
                const toplamGelirler = data.map(item => item.toplam_gelir);
                const toplamGiderler = data.map(item => item.toplam_gider);

                myChart = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: urunAdlari,
                        datasets: [
                            {
                                label: "Gelir (TL)",
                                data: toplamGelirler,
                                backgroundColor: "rgba(75, 192, 192, 0.6)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 1
                            },
                            {
                                label: "Gider (TL)",
                                data: toplamGiderler,
                                backgroundColor: "rgba(255, 99, 132, 0.6)",
                                borderColor: "rgba(255, 99, 132, 1)",
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "top"
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            })
            .catch(error => console.error("API Hatası:", error));
    };
    fetchDataAndRenderChart(yilSecimi.value);
    yilSecimi.addEventListener("change", () => {
        fetchDataAndRenderChart(yilSecimi.value);
    });
});

// üçüncü grafik
document.addEventListener("DOMContentLoaded", () => {
    let secilenYil = "2023";
    let mevcutGrafik = null;

    const yilSec = document.getElementById("yilSecim3");
    yilSec.addEventListener("change", () => {
        secilenYil = yilSec.value;
        satisMiktarGrafikOlustur(secilenYil);
    });

    function satisMiktarGrafikOlustur(yil) {
        fetch(`/api/satisMiktarlari?yil=${yil}`)
            .then((response) => response.json())
            .then((data) => {
                const urunAdlari = data.map((item) => item.urun_adi);
                const toplamMiktarlar = data.map((item) => item.toplam_satilan_miktar);

                const canvas = document.getElementById("satismiktarGrafik");

                if (mevcutGrafik) {
                    mevcutGrafik.destroy();
                }

                mevcutGrafik = new Chart(canvas, {
                    type: "bar",
                    data: {
                        labels: urunAdlari,
                        datasets: [{
                            label: "Toplam Satış Miktarı",
                            data: toplamMiktarlar,
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: "y",
                        scales: {
                            x: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            })
            .catch((error) => {
                console.error("API Hatası:", error);
            });
    }

    satisMiktarGrafikOlustur(secilenYil);
});

// dördüncü grafik
document.addEventListener("DOMContentLoaded", () => {
    let secilenYil = "2023";
    let mevcutGrafik = null;

    const yilSec = document.getElementById("yilSecim4");
    yilSec.addEventListener("change", () => {
        secilenYil = yilSec.value;
        kategoriKarGrafikOlustur(secilenYil);
    });

    function kategoriKarGrafikOlustur(yil) {
        fetch(`/api/kategoriKarYuzdeleri?yil=${yil}`)
            .then((response) => response.json())
            .then((data) => {
                const kategoriler = data.map((item) => item.kategori);
                const yuzdeler = data.map((item) => parseFloat(item.kar_yuzdesi.toFixed(2)));

                const canvas = document.getElementById("kategoriKarGrafik");
                if (mevcutGrafik) {
                    mevcutGrafik.destroy();
                }

                mevcutGrafik = new Chart(canvas, {
                    type: "pie",
                    data: {
                        labels: kategoriler,
                        datasets: [{
                            label: "Kar Yüzdesi",
                            data: yuzdeler,
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.2)",
                                "rgba(54, 162, 235, 0.2)",
                                "rgba(255, 206, 86, 0.2)",
                                "rgba(75, 192, 192, 0.2)",
                                "rgba(153, 102, 255, 0.2)",
                                "rgba(255, 159, 64, 0.2)"
                            ],
                            borderColor: [
                                "rgba(255, 99, 132, 1)",
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 206, 86, 1)",
                                "rgba(75, 192, 192, 1)",
                                "rgba(153, 102, 255, 1)",
                                "rgba(255, 159, 64, 1)"
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.raw}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            })
            .catch((error) => {
                console.error("API Hatası:", error);
            });
    }

    kategoriKarGrafikOlustur(secilenYil);
});

// tahminleme özet
document.addEventListener("DOMContentLoaded", () => {
fetch('/api/ozet-tahmin')
    .then(response => response.json())
    .then(data => {
        document.getElementById('en-karli-urun-veri-2025').textContent = data.en_karli_urun_2025 || 'Veri Yok';
        document.getElementById('en-karsiz-urun-veri-2025').textContent = data.en_karsiz_urun_2025 || 'Veri Yok';
        document.getElementById('en-cok-satilan-urun-veri-2025').textContent = data.en_cok_satilan_urun_2025 || 'Veri Yok';
        document.getElementById('toplam-gelir-2025').textContent = `Gelir: ₺${data.toplam_gelir_2025 || 0}`;
        document.getElementById('toplam-gider-2025').textContent = `Gider: ₺${data.toplam_gider_2025 || 0}`;
        document.getElementById('toplam-kar-veri-2025').textContent = `Net Kâr: ₺${data.toplam_kar_2025 || 0}`;
    })
    .catch(error => {
        console.error('API Hatası:', error);
    });
});

// tahminleme ilk grafik
document.addEventListener("DOMContentLoaded", () => {
fetch('/api/tahmin-urunler')
    .then(response => response.json())
    .then(data => {
        const urunAdi = data.map(item => item.urun_adi);
        const tahminiKar2024 = data.map(item => item.tahmini_kar_2024);

        const ctx = document.getElementById('urunBazliGrafik').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: urunAdi,
                datasets: [{
                    label: 'Tahmini Kâr',
                    data: tahminiKar2024,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('API Hatası:', error);
    });
});

// tahminleme ikinci grafik
document.addEventListener("DOMContentLoaded", () => {
        fetch(`/api/tahmin-satisMiktarlari`)
            .then((response) => response.json())
            .then((data) => {
                const urunAdlari = data.map((item) => item.urun_adi);
                const tahminiMiktarlar = data.map((item) => item.tahmini_satis);

                const canvas = document.getElementById("tahminimiktarGrafik");
                mevcutGrafik = new Chart(canvas, {
                    type: "bar",
                    data: {
                        labels: urunAdlari,
                        datasets: [{
                            label: "Tahmini Satış Miktarı",
                            data: tahminiMiktarlar,
                            backgroundColor: "rgba(75, 106, 192, 0.2)",
                            borderColor: "rgb(75, 75, 192)",
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: "y",
                        scales: {
                            x: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            })
            .catch((error) => {
                console.error("API Hatası:", error);
            });
    }
);

