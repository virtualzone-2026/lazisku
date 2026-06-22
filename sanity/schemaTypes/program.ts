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
      // 🚀 FIXED: Dibuat readOnly agar admin di Sanity tidak bisa edit manual & merusak hitungan webhook!
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
    // 🚀 FIXED: Menambahkan wadah Array Donatur agar Sanity bisa menampung nama & nominal yang dikirim Webhook
    defineField({
      name: 'donors',
      title: 'Daftar Donatur Terverifikasi',
      type: 'array',
      readOnly: true, // Biar tidak bisa dimanipulasi manual dari dashboard oleh admin
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
  ],
});