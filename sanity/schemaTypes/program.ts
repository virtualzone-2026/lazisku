import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'program',
  title: 'Program Donasi',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Judul Campaign',
      type: 'string',
      validation: (Rule) => Rule.required().error('Judul wajib diisi'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('Slug wajib digenerate'),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Kemanusiaan', value: 'KEMANUSIAAN' },
          { title: 'Pendidikan', value: 'PENDIDIKAN' },
          { title: 'Kesehatan', value: 'KESEHATAN' },
          { title: 'Infrastruktur', value: 'INFRASTRUKTUR' },
        ],
      },
      initialValue: 'KEMANUSIAAN',
    }),
    defineField({
      name: 'image',
      title: 'Foto / Cover Utama',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('Foto wajib diunggah'),
    }),
    defineField({
      name: 'collectedRaw',
      title: 'Nominal Terkumpul (Otomatis dari Pakasir)',
      type: 'number',
      initialValue: 0,
      readOnly: true, 
      description: 'Field ini terkunci otomatis. Angka akan bertambah sendiri secara realtime saat donasi QRIS sukses.',
    }),
    defineField({
      name: 'targetAmount',
      title: 'Target Donasi (Rupiah)',
      type: 'number',
      initialValue: 50000000,
      description: 'Contoh: 50000000 untuk target Rp 50 Juta.',
    }),
    defineField({
      name: 'description',
      title: 'Cerita / Deskripsi Lengkap',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Tulis narasi lengkap atau cerita edukasi program di sini.',
    }),
    defineField({
      name: 'donors',
      title: 'Daftar Donatur Terverifikasi',
      type: 'array',
      readOnly: true, 
      description: 'List riwayat nama hamba allah dan donatur yang masuk dari sistem QRIS Pakasir.',
      of: [
        {
          type: 'object',
          title: 'Detail Donatur',
          fields: [
            { name: 'name', type: 'string', title: 'Nama Donatur' },
            { name: 'amount', type: 'number', title: 'Nominal Donasi' },
            { name: 'date', type: 'string', title: 'Tanggal Donasi' },
          ],
        },
      ],
    }),
    
    // ===================================================================
    // 🚀 FIXED: MENAMBAHKAN WADAH ARRAY LAPORAN PENYALURAN (IMPLEMENTASI DANA)
    // ===================================================================
    defineField({
      name: 'reports',
      title: 'Laporan Penyaluran / Implementasi Program',
      type: 'array',
      description: 'Input rincian penyaluran dana berkala dan bukti dokumentasi rilisan dari amil lapangan.',
      of: [
        {
          type: 'object',
          title: 'Item Laporan',
          fields: [
            { 
              name: 'title', 
              type: 'string', 
              title: 'Judul Aktivitas Laporan',
              description: 'Contoh: Pembelian Material Semen Tahap Belanja Utama'
            },
            { 
              name: 'date', 
              type: 'string', 
              title: 'Tanggal Penyaluran',
              description: 'Contoh: 8 Juli 2026'
            },
            { 
              name: 'content', 
              type: 'array', 
              title: 'Detail Catatan Implementasi',
              of: [{ type: 'block' }],
              description: 'Tulis deskripsi detail penyaluran amanah secara transparan di sini.'
            },
            { 
              name: 'image', 
              type: 'image', 
              title: 'Foto / Bukti Dokumentasi Lapangan',
              options: { hotspot: true }
            },
          ],
        },
      ],
    }),
  ],
});