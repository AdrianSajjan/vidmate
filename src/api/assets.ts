import { api } from "@/config/api";
import { EditorTemplate } from "@/types/editor";
import { useInfiniteQuery } from "@tanstack/react-query";

const baseQuery = "/customer/ads/api/v1/editor";

interface FetchTemplateParams {
  is_published: boolean;
  limit: number;
  offset?: number;
}

interface FetchTemplatesResponse {
  data: {
    templates: EditorTemplate[];
  };
}

async function fetchVideoTemplates(params: FetchTemplateParams) {
  const response = await api.get<FetchTemplatesResponse>(`${baseQuery}/video-templates/all`, { params });
  return response.data.data.templates.map((template) => ({ ...template, pages: JSON.parse(template.pages as unknown as string) }));
}

function useFetchVideoTemplates(params: FetchTemplateParams) {
  return useInfiniteQuery({
    queryKey: [fetchVideoTemplates.name],
    queryFn: ({ pageParam: offset }) => fetchVideoTemplates({ ...params, offset }),
    initialPageParam: 0,
    getNextPageParam: (page, _, param) => {
      if (!page.length) return undefined;
      return param + params.limit;
    },
  });
}

export { fetchVideoTemplates, useFetchVideoTemplates };
