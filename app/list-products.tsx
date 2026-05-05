import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGetMe } from '@titus-system/syncdesk';
import { apiFetch } from '@/lib/api';

/* ---------------- TYPES ---------------- */

type AppUser = {
  id: string;
  company_id?: string | null;
};

type Product = {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
};

type CompanyProductsResponse = {
  total: number;
  page: number;
  limit: number;
  items: Product[];
  meta: {
    timestamp: string;
    success: boolean;
    request_id: string;
  };
};

/* ---------------- API ---------------- */

async function fetchCompanyProducts(companyId: string): Promise<CompanyProductsResponse> {
  const res = await apiFetch<CompanyProductsResponse>(`/companies/${companyId}/products`);

  return res;
}

/* ---------------- SCREEN ---------------- */

export default function ListProductsScreen() {
  const { data: rawUser } = useGetMe();

  const user = rawUser as unknown as AppUser | undefined;

  const companyId = user?.company_id ?? null;

  const { data, isLoading, isError, refetch } = useQuery<CompanyProductsResponse>({
    queryKey: ['company-products', companyId],

    enabled: !!companyId, // <- mais seguro que typeof

    queryFn: async () => {
      if (!companyId) throw new Error('companyId missing');

      return fetchCompanyProducts(companyId);
    },

    // 🔥 garante que não usa cache antigo quebrado
    staleTime: 0,
  });

  const products = data?.items ?? [];

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      {/* HEADER */}
      <View className="bg-[#500D0D] px-5 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white font-bold text-4xl">Produtos/soluções</Text>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {isLoading && <ActivityIndicator color="#500D0D" size="large" />}

        {isError && (
          <TouchableOpacity onPress={() => refetch()}>
            <Text>Erro ao carregar. Toque para tentar novamente.</Text>
          </TouchableOpacity>
        )}

        {!isLoading && products.length === 0 && (
          <Text className="text-slate-600">Nenhum produto encontrado para sua empresa.</Text>
        )}

        {products.map((product) => (
          <View key={product.id} className="bg-white rounded-2xl p-4 mb-3">
            <Text className="text-slate-900 font-bold text-base">{product.name}</Text>

            {!!product.description && (
              <Text className="text-slate-600 text-sm mt-1">{product.description}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
