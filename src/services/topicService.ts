import { supabase } from "../lib/supabase";

export const getTopicsByCategory = async (
  categoryId: string,
) => {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at");

  if (error) {
    throw error;
  }

  return data;
};

export const getFirstTopic = async () => {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("created_at")
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
};