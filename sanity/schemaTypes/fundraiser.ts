// schemas/fundraiser.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'fundraiser',
  title: 'Pendaftaran Fundraiser',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nama Lengkap',
      type: 'string',
      validation: (Rule) => Rule.required().error('Nama wajib diisi'),
    }),
    defineField({
      name: 'phone',
      title: 'Nomor WhatsApp',
      type: 'string',
      validation: (Rule) => Rule.required().error('Nomor WhatsApp wajib diisi'),
    }),
    defineField({
      name: 'program',
      title: 'Program yang Didukung',
      type: 'reference',
      to: [{ type: 'program' }],
      validation: (Rule) => Rule.required().error('Wajib memilih program donasi'),
    }),
    defineField({
      name: 'status',
      title: 'Status Verifikasi',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Approval', value: 'pending' },
          { title: 'Disetujui (Aktif)', value: 'approved' },
          { title: 'Ditolak', value: 'rejected' },
        ],
      },
      initialValue: 'pending',
    }),
  ],
});