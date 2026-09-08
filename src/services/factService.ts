import { supabase } from "../lib/supabase";

export const getTodaysFact = async () => {
  const { data, error } = await supabase
    .from("facts")
    .select(`
      id,
      title,
      content,
      image_url,
      source,
      created_at,
      categories (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
};