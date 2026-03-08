export interface GeographyItem {
  id: string;
  name: string;
}

export interface Community extends GeographyItem {
  corregimientoId: string;
}

export interface Corregimiento extends GeographyItem {
  districtId: string;
  communities: Community[];
}

export interface District extends GeographyItem {
  provinceId: string;
  corregimientos: Corregimiento[];
}

export interface Province extends GeographyItem {
  districts: District[];
}

// Sample Mock Data for Panama Geography
export const panamaGeography: Province[] = [
  {
    id: "P1",
    name: "Panamá",
    districts: [
      {
        id: "D1",
        provinceId: "P1",
        name: "Panamá",
        corregimientos: [
          {
            id: "C1",
            districtId: "D1",
            name: "San Francisco",
            communities: [
              { id: "COM1", corregimientoId: "C1", name: "Punta Paitilla" },
              { id: "COM2", corregimientoId: "C1", name: "Punta Pacífica" },
            ],
          },
          {
            id: "C2",
            districtId: "D1",
            name: "Bella Vista",
            communities: [
              { id: "COM3", corregimientoId: "C2", name: "El Cangrejo" },
              { id: "COM4", corregimientoId: "C2", name: "Obarrio" },
            ],
          },
        ],
      },
      {
        id: "D2",
        provinceId: "P1",
        name: "San Miguelito",
        corregimientos: [
          {
            id: "C3",
            districtId: "D2",
            name: "Amelia Denis de Icaza",
            communities: [
              { id: "COM5", corregimientoId: "C3", name: "Pan de Azúcar" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "P2",
    name: "Panamá Oeste",
    districts: [
      {
        id: "D3",
        provinceId: "P2",
        name: "La Chorrera",
        corregimientos: [
          {
            id: "C4",
            districtId: "D3",
            name: "Barrio Balboa",
            communities: [
              { id: "COM6", corregimientoId: "C4", name: "La Seda" },
            ],
          },
        ],
      },
      {
        id: "D4",
        provinceId: "P2",
        name: "Arraiján",
        corregimientos: [
          {
            id: "C5",
            districtId: "D4",
            name: "Juan Demóstenes Arosemena",
            communities: [
              { id: "COM7", corregimientoId: "C5", name: "Nuevo Arraiján" },
            ],
          },
        ],
      },
    ],
  },
];
