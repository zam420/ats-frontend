export enum AdressEnum {
  SHANG_HAI = '上海市浦东新区碧波路 690 号张江微电子港 2 号楼 304 室',
  SU_ZHOU = '苏州市工业园区钟园路 750 号国泰新金融大厦 21 楼 2101 室',
  SINGAPORE = '1 Fusionopolis View #07-02, Eclipse Building, Singapore 138577'
}

export const Adress: Record<string, CommonEnum.enumItem> = {
  [AdressEnum.SHANG_HAI]: {
    value: AdressEnum.SHANG_HAI,
    name: AdressEnum.SHANG_HAI
  },
  [AdressEnum.SU_ZHOU]: {
    value: AdressEnum.SU_ZHOU,
    name: AdressEnum.SU_ZHOU
  },
  [AdressEnum.SINGAPORE]: {
    value: AdressEnum.SINGAPORE,
    name: AdressEnum.SINGAPORE
  }
}
