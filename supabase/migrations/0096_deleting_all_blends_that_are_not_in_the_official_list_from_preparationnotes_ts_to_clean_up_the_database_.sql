DELETE FROM public.blends
WHERE code NOT IN (
  'V01', 'V02', 'V03', 'V04', 'V05',
  'C01', 'C02',
  'K01', 'K02',
  'T01', 'T02', 'T03', 'T04', 'T05',
  'E01', 'E02', 'E03', 'E04', 'E05',
  'FP01', 'FP02',
  'AP01', 'AP02',
  'CB01', 'CB02',
  'GCI01', 'GB01', 'GHI01'
);