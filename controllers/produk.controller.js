const ProdukModel = require('../models/produk.model');

exports.getDaftarProduk = async (req, res) => {
  try {
    const produkList = await ProdukModel.getAll();
    res.render('pages/produk-list', {
      pageTitle: 'Daftar Inventaris Produk',
      produkList: produkList
    });
  } catch (error) {
    console.error('[ERROR getDaftarProduk]:', error);
    res.status(500).send('Terjadi galat internal peladen saat mengambil data.');
  }
};

exports.getFormTambah = (req, res) => {
  res.render('pages/produk-form-tambah', { pageTitle: 'Form Tambah Produk Baru' });
};

exports.postTambahProduk = async (req, res) => {
  try {
    const { nama_produk, kategori, harga, stok } = req.body;

    // Validasi server-side sederhana
      if (!nama_produk || !kategori || !harga || !stok) {
        return res.status(400).send('Seluruh field formulir wajib diisi.');
      }

    // Kirim data ke layer Model
    await ProdukModel.create({ nama_produk, kategori, harga, stok });

    // Pola Post-Redirect-Get (PRG)
    console.log(`[DATABASE] Data "${nama_produk}" berhasil di-insert.`);
    res.redirect('/produk');
  } catch (error) {
    console.error('[ERROR postTambahProduk]:', error);
    res.status(500).send('Gagal menyimpan data ke basis data.');
  }
};

exports.getFormEdit = async (req, res) => {
  try {
    const { id } = req.params; // Menangkap parameter rute URL
    const produk = await ProdukModel.getById(id);

    if (!produk) {
      return res.status(404).send('Produk tidak ditemukan.');
    }

    res.render('pages/produk-form-edit', {
      pageTitle: 'Edit Data Produk',
      produk: produk
    });
  } catch (error) {
    console.error('[ERROR getFormEdit]:', error);
    res.status(500).send('Galat internal saat memuat form edit.');
  }
};

exports.postUpdateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, kategori, harga, stok } = req.body;

    await ProdukModel.update(id, { nama_produk, kategori, harga, stok });
    console.log(`[DATABASE] Record ID ${id} berhasil diperbarui.`);

    res.redirect('/produk');
  } catch (error) {
    console.error('[ERROR postUpdateProduk]:', error);
    res.status(500).send('Gagal memperbarui record data.');
  }
};

exports.postHapusProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProdukModel.delete(id);

    if (result.affectedRows === 0) {
      console.warn(`[DATABASE] Tidak ada record yang terhapus untuk ID ${id}`);
    } else {
      console.log(`[DATABASE] Record ID ${id} berhasil dihapus.`);
    }

    res.redirect('/produk');
  } catch (error) {
    console.error('[ERROR postHapusProduk]:', error);
    res.status(500).send('Gagal menghapus entitas dari basis data.');
  }
};