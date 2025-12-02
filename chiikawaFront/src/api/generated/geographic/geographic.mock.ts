/**
 * Mock implementation for Geographic API
 * 从本地 JSON 文件读取省份和城市数据
 */
import type { ProvinceItem, CityItem, queryProvinceResponse, queryCityResponse } from './geographic'
import provinceData from '../../../pages/profile/geographic/province.json'
import cityData from '../../../pages/profile/geographic/city.json'

/**
 * Mock: 获取省份列表
 */
export const queryProvinceMock = async (
  options?: RequestInit,
): Promise<queryProvinceResponse> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return {
    data: provinceData as ProvinceItem[],
    status: 200,
    headers: new Headers(),
  }
}

/**
 * Mock: 根据省份ID获取城市列表
 */
export const queryCityMock = async (
  provinceId: string,
  options?: RequestInit,
): Promise<queryCityResponse> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  // 从 cityData 中根据 provinceId 获取对应的城市列表
  const cities = (cityData as Record<string, CityItem[]>)[provinceId] || []
  
  return {
    data: cities,
    status: 200,
    headers: new Headers(),
  }
}

