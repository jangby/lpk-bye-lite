// Daftar program pelatihan (sumber tunggal untuk form, kuota, dan admin)
export const PROGRAMS = [
  { code: 'digital-marketing', name: 'Digital Marketing Bersertifikasi BNSP', short: 'Digital Marketing' },
  { code: 'bahasa-jepang', name: 'Pelatihan Bahasa dan Budaya Jepang', short: 'Bahasa Jepang' },
];

export const programCodes = () => PROGRAMS.map((p) => p.code);
