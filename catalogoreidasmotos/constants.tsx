
import { Vehicle, VehicleType } from './types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'hero-1',
    name: 'Ducati Panigale V4',
    price: 145900,
    type: VehicleType.MOTO,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200',
    isFeatured: true,
  },
  {
    id: 'm-1',
    name: 'SuperSport 950 S',
    price: 92500,
    type: VehicleType.MOTO,
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f97dbbe480?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'm-2',
    name: 'Monster Stealth',
    price: 78900,
    type: VehicleType.MOTO,
    imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'c-1',
    name: 'Carrera 911 GT3',
    price: 1820000,
    type: VehicleType.CARRO,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'c-2',
    name: 'RS6 Performance',
    price: 980000,
    type: VehicleType.CARRO,
    imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 's-1',
    name: 'Luxury SUV Limited',
    price: 'Preço sob consulta',
    type: VehicleType.CARRO,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    isSold: true,
  },
  {
    id: 's-2',
    name: 'M4 Competition Black',
    price: 'Preço sob consulta',
    type: VehicleType.CARRO,
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600',
    isSold: true,
  },
];
