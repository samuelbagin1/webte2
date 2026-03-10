import { useState, useEffect, useCallback } from "react";
import api from "@/api/client";

// fetch athletes from api with server-side filtering, sorting and pagination
// API call: GET /api/athletes?page=1&limit=10&sort=surname&order=ASC&year=2024&discipline=3

interface AthleteRecord {
    id: number;
    name: string;
    surname: string;
    year: number;
    type: string;
    city: string;
    country: string;
    discipline: string;
    placing: number;
}

interface UseAthletesParams {
    page: number;
    limit: number;
    sort: string;
    order: "ASC" | "DESC" | "";
    year?: number | null;
    discipline?: number | null;
}

interface UseAthletesResult {
    data: AthleteRecord[];
    total: number;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}


export function useAthletes(params: UseAthletesParams): UseAthletesResult {
    const [data, setData] = useState<AthleteRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    
    const fetchAthletes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams: Record<string, string | number> = {
                page: params.page,
                limit: params.limit
            };

            if (params.sort && params.order) {
                queryParams.sort = params.sort;
                queryParams.order = params.order;
            }

            if (params.year) queryParams.year = params.year;
            if (params.discipline) queryParams.discipline = params.discipline;

            const {data: response} = await api.get("/athletes", {
                params: queryParams
            });

            setData(response.data);
            setTotal(response.total);


        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Nepodarilo sa načítať dáta";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [params.page, params.limit, params.sort, params.order, params.year, params.discipline]);

    useEffect(() => {
        fetchAthletes();
    }, [fetchAthletes]);


    return {data, total, loading, error, refetch: fetchAthletes};
}