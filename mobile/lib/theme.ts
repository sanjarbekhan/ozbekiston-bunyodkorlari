export const palette = {
  ink: '#11211A',
  inkMuted: '#65736C',
  brand: '#0B6B48',
  brandDeep: '#075039',
  brandSoft: '#DDF2E8',
  gold: '#C79A3B',
  sky: '#DDEDF7',
  background: '#F4F7F5',
  surface: '#FFFFFF',
  line: '#E3E9E5',
  danger: '#C94444',
} as const;

export const radii = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 } as const;
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 42 } as const;

export const shadow = {
  shadowColor: '#0B2D20',
  shadowOpacity: 0.08,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
} as const;
