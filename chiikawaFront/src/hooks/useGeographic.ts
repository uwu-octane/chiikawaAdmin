import { useQuery } from '@tanstack/react-query'
import { queryProvince, queryCity, type ProvinceItem, type CityItem } from '@/api/generated/geographic/geographic'

/**
 * 获取省份列表的 React Query hook
 */
export const useProvinces = () => {
  return useQuery<ProvinceItem[]>({
    queryKey: ['geographic', 'provinces'],
    queryFn: async () => {
      const response = await queryProvince()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 30 * 60 * 1000, // 缓存30分钟
  })
}

/**
 * 根据省份ID获取城市列表的 React Query hook
 * @param provinceId 省份ID
 * @param enabled 是否启用查询（当provinceId为空时禁用）
 */
export const useCities = (provinceId: string | undefined, enabled = true) => {
  return useQuery<CityItem[]>({
    queryKey: ['geographic', 'cities', provinceId],
    queryFn: async () => {
      if (!provinceId) {
        throw new Error('Province ID is required')
      }
      const response = await queryCity(provinceId)
      return response.data
    },
    enabled: enabled && !!provinceId, // 只有当provinceId存在时才执行查询
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 30 * 60 * 1000, // 缓存30分钟
  })
}

