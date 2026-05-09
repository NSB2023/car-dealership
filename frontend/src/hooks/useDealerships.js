import { useQuery } from "@tanstack/react-query"
import { getDealerships, getDealershipById } from "../api/dealerships"

export function useDealerships() {
  return useQuery({
    queryKey: ["dealerships"],
    queryFn: getDealerships,
  })
}

export function useDealership(id) {
  return useQuery({
    queryKey: ["dealership", id],
    queryFn: () => getDealershipById(id),
    enabled: !!id,
  })
}
