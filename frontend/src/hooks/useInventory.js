import { useQuery } from "@tanstack/react-query"
import { getCars, getFeaturedCars, getCarById } from "../api/inventory"

export function useInventory(params = {}) {
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: () => getCars(params),
  })
}

export function useFeaturedCars() {
  return useQuery({
    queryKey: ["featured-cars"],
    queryFn: getFeaturedCars,
  })
}

export function useCar(id) {
  return useQuery({
    queryKey: ["car", id],
    queryFn: () => getCarById(id),
    enabled: !!id,
  })
}
