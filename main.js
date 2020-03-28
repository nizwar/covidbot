const { Client } = require('whatsapp-web.js');

const qrCode = require('qrcode');
const http = require('http');
const request = require('request');
const client = new Client();


const stop = "\n\n===============\nBalas pesan ini dengan *stop* untuk berhenti automasi Covid19"
const penggunaMode = new Map();
const penggunaHoax = new Map();

var server = http.createServer(function (req, res) {
    client.on('qr', async (qr) => {
        var gambar = await qrCode.toDataURL(qr);
        var body = "<center><img src='" + gambar + "'></img><br/>Silahkan scan qrcode ini dengan Whatsapp</center>";

        res.writeHead(200, {
            'Content-Length': body.length,
            'Content-Type': 'text/html',
            'Pesan-Header': 'Pengenalan Node.js'
        });

        res.write(body);
    });
    client.on('ready', () => {
        var body = "<center><h1>Berhasil terhubung</h1></center>";

        res.writeHead(200, {
            'Content-Length': body.length,
            'Content-Type': 'text/html',
            'Pesan-Header': 'Pengenalan Node.js'
        });

        res.write(body);
    });

});

client.on('message', async msg => {
    var kontak = await msg.getContact();
    mode = penggunaMode.get(kontak.number) || "stop";
    switch (mode.toLowerCase()) {
        case "covid19":
            switch (msg.body.toLowerCase()) {
                case "hoax":
                    penggunaMode.set(kontak.number, "hoax");
                    penggunaHoax.set(kontak.number, 0);
                    msg.reply("Anda memasuki mode automasi Informasi Klarifikasi hoax terbaru, Berita sedang dimuat..." + stop)
                    getHoax(msg, kontak.number);
                    break;
                case "sembuh":
                    request("https://api.kawalcorona.com/sembuh/", { json: true }, (err, res, body) => {
                        if (err) {
                            msg.reply("Mohon maaf, sepertinya terjadi sesuatu, sistem gagal memuat data" + stop);
                            return console.log(err);
                        }
                        msg.reply("Pasien Covid19 yang dinyatakan sembuh diseluruh dunia sebanyak " + body.value + stop);
                    });
                    break;
                case "positif":
                    request("https://api.kawalcorona.com/positif/", { json: true }, (err, res, body) => {
                        if (err) {
                            msg.reply("Mohon maaf, sepertinya terjadi sesuatu, sistem gagal memuat data" + stop);
                            return console.log(err);
                        }
                        msg.reply("Pasien Covid19 yang dinyatakan positif diseluruh dunia sebanyak " + body.value + stop);
                    });
                    break;
                case "meninggal":
                    request("https://api.kawalcorona.com/meninggal/", { json: true }, (err, res, body) => {
                        if (err) {
                            msg.reply("Mohon maaf, sepertinya terjadi sesuatu, sistem gagal memuat data" + stop);
                            return console.log(err);
                        }
                        msg.reply("Pasien Covid19 yang dinyatakan meninggal diseluruh dunia sebanyak " + body.value + stop);
                    });
                    break;
                case "negara":
                    penggunaMode.set(kontak.number, "negara");
                    msg.reply("Anda memasuki mode automasi informasi Negara yang terserang wabah Covid19, balas pesan ini dengan negara mana yang ingin anda ketahui informasinya." + stop)
                    break;
                case "provinsi":
                    penggunaMode.set(kontak.number, "provinsi");
                    msg.reply("Anda memasuki mode automasi informasi Provinsi Indonesia yang terserang wabah Covid19, balas pesan ini dengan provinsi mana yang ingin anda ketahui informasinya." + stop)
                    break;
                case "stop":
                    break;
                case "covid19":
                    break;
                default:
                    msg.reply("Perintah tidak valid" + stop);
                    return;

            }
            break;
        case "negara":
            if (msg.body.toLowerCase() != "stop" && msg.body.toLowerCase() != "covid19") {
                request("https://api.kawalcorona.com/", { json: true }, (err, res, body) => {
                    if (err) {
                        msg.reply("Mohon maaf, sepertinya terjadi sesuatu, sistem gagal memuat data" + stop);
                        return console.log(err);
                    }
                    var output = "Negara tidak ditemukan"
                    if (msg.body.toLowerCase() == "semua") output = "";
                    for (let i = 0; i < body.length; i++) {
                        if (msg.body.toLowerCase() == "semua") {
                            output += "Negara " + body[i].attributes.Country_Region + ":\n" + "Positif : " + body[i].attributes.Confirmed + " orang\n" + "Sembuh : " + body[i].attributes.Recovered + " orang\n" + "Meninggal : " + body[i].attributes.Deaths + " orang";
                            if (i < body.length - 1) output += "\n\n =============== \n\n";
                        } else if (body[i].attributes.Country_Region.toLowerCase() == msg.body.toLowerCase()) {
                            output = "_*Negara " + body[i].attributes.Country_Region + "*_\n" + "Positif : " + body[i].attributes.Confirmed + " orang\n" + "Sembuh : " + body[i].attributes.Recovered + " orang\n" + "Meninggal : " + body[i].attributes.Deaths + " orang";
                            break;
                        }
                    }
                    msg.reply(output + stop);
                });

                return;
            }
            break;
        case "provinsi":
            if (msg.body.toLowerCase() != "stop" && msg.body.toLowerCase() != "covid19") {
                request("https://api.kawalcorona.com/indonesia/provinsi", { json: true }, (err, res, body) => {
                    if (err) {
                        msg.reply("Mohon maaf, sepertinya terjadi sesuatu, sistem gagal memuat data" + stop);
                        return console.log(err);
                    }
                    var output = "Provinsi tidak ditemukan";
                    if (msg.body.toLowerCase() == "semua") output = "";
                    for (let i = 0; i < body.length; i++) {
                        if (msg.body.toLowerCase() == "semua") {
                            output += "Provinsi " + body[i].attributes.Provinsi + ":\n" + "Positif : " + body[i].attributes.Kasus_Posi + " orang\n" + "Sembuh : " + body[i].attributes.Kasus_Semb + " orang\n" + "Meninggal : " + body[i].attributes.Kasus_Meni + " orang";
                            if (i < body.length - 1) output += "\n\n =============== \n\n";
                        } else if (body[i].attributes.Provinsi.toLowerCase() == msg.body.toLowerCase()) {
                            output = "_*Provinsi " + body[i].attributes.Provinsi + "*_\n" + "Positif : " + body[i].attributes.Kasus_Posi + " orang\n" + "Sembuh : " + body[i].attributes.Kasus_Semb + " orang\n" + "Meninggal : " + body[i].attributes.Kasus_Meni + " orang";
                            break;
                        }
                    }
                    msg.reply(output + stop);
                });
                return;
            }
            break;
        case "hoax":
            var page = penggunaHoax.get(kontak.number);
            if (page == null) page = 0;
            if (msg.body.toLowerCase().startsWith("cari")) {
                penggunaHoax.set(kontak.number, 0);
                var cari = msg.body.substring("cari".length).trim();
                if (cari.length == 0) {
                    msg.reply("Masukan kata kunci setelah *Cari*, contoh *Cari telur ayam*")
                    return;
                }
                getHoax(msg, kontak.number, cari);
                return;
            }
            switch (msg.body.toLowerCase()) {
                case "lanjut":
                    penggunaHoax.set(kontak.number, page + 1);
                    getHoax(msg, kontak.number);
                    break;
                case "kembali":
                    if (page == 0) {
                        msg.reply("Anda sudah berada di informasi awal")
                        return;
                    }
                    penggunaHoax.set(kontak.number, page - 1);
                    getHoax(msg, kontak.number);
                    break;
                case "stop":
                    break;
                case "covid19":
                    break;
                default:
                    msg.reply("Perintah tidak valid" + stop);
            }
            break;
        default:
            break;
    }

    switch (msg.body.toLowerCase()) {
        case "covid19":
            if (mode.toLowerCase() == "covid19") return;
            penggunaMode.set(kontak.number, "covid19");
            msg.reply(
                "Hai, Selamat datang disistem automasi informasi Covid19. Sistem ini siap memberikanmu informasi terkini tentang musibah Covid19 yang melanda diseluruh Dunia.\n\nBalas dengan *hoax* untuk mendapatkan informasi klarifikasi hoax terbaru\n\n===============\n\nUntuk melihat informasi pasien positif diseluruh dunia, balas pesan ini dengan *positif*\n\nUntuk melihat informasi pasien sembuh diseluruh dunia, balas pesan ini dengan *sembuh*\n\n===============\n\nBalas pesan ini dengan *negara* atau *provinsi* untuk mendapatkan informasi spesifik negara atau provinsi yang ingin anda ketahui"
            );
            break;
        case "stop":
            if (mode.toLowerCase() == "stop") return;
            penggunaMode.set(kontak.number, "stop");
            msg.reply("Automasi dihentikan, untuk mengaktifkannya kembali, balas pesan ini dengan *covid19*")
        default:
            break;
    }
});

function getHoax(msg, nomor, cari = "corona") {
    var page = penggunaHoax.get(nomor);
    if (page == null) page = 0;
    request("https://turnbackhoax.id/wp-json/wp/v2/posts?search=" + cari + "&per_page=3&offset=" + (3 * page) + "&_fields=title,link",
        { json: true },
        async (err, res, body) => {
            if (err) {
                msg.reply("Mohon maaf, sepertinya terjadi sesuatu, sistem gagal memuat data" + stop);
                return console.log(err);
            }
            var output = "Informasi Klarifikasi Hoax\n================\n\n";
            if (cari != "corona") output == "Hasil pencarian :\n" + cari + "\n================\n\n"
            if (body.length == 0) {
                msg.reply("Sepertinya informasi klarifikasi yang anda maksud belum tersedia.")
                return;
            }
            for (let i = 0; i < body.length; i++) {
                output += "*" + body[i].title.rendered + "*\n" + body[i].link + "\n\n";
                if (i < body.length - 1) output += "---------------\n\n";
            }

            var pesan = "Balas *kembali* atau *lanjut* untuk menavigasi informasi.\nBalas dengan *cari _JUDUL YANG DICARI_* untuk mencari informasi klarifikasi hoax yang anda inginkan.";
            msg.reply(output + pesan + stop);
        });
}

client.initialize();
server.listen(80);