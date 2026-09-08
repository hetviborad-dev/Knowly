import { supabase } from "../lib/supabase";


// ============================================
// GET CURRENT USER
// ============================================

const getCurrentUserId = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("User is not logged in");
  }

  return user.id;
};


// ============================================
// GET USER'S LIKED + SAVED FACTS
// ============================================

export const getFactInteractions = async () => {
  const userId = await getCurrentUserId();

  const [
    { data: likedFacts, error: likedError },
    { data: savedFacts, error: savedError },
  ] = await Promise.all([
    supabase
      .from("liked_facts")
      .select("fact_id")
      .eq("user_id", userId),

    supabase
      .from("saved_facts")
      .select("fact_id")
      .eq("user_id", userId),
  ]);

  if (likedError) {
    throw likedError;
  }

  if (savedError) {
    throw savedError;
  }

  return {
    likedFactIds:
      likedFacts?.map(item => item.fact_id) ?? [],

    savedFactIds:
      savedFacts?.map(item => item.fact_id) ?? [],
  };
};


// ============================================
// LIKE FACT
// ============================================

export const likeFact = async (
  factId: string,
) => {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("liked_facts")
    .insert({
      user_id: userId,
      fact_id: factId,
    });

  if (error) {
    throw error;
  }
};


// ============================================
// UNLIKE FACT
// ============================================

export const unlikeFact = async (
  factId: string,
) => {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("liked_facts")
    .delete()
    .eq("user_id", userId)
    .eq("fact_id", factId);

  if (error) {
    throw error;
  }
};


// ============================================
// SAVE FACT
// ============================================

export const saveFact = async (
  factId: string,
) => {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("saved_facts")
    .insert({
      user_id: userId,
      fact_id: factId,
    });

  if (error) {
    throw error;
  }
};


// ============================================
// UNSAVE FACT
// ============================================

export const unsaveFact = async (
  factId: string,
) => {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("saved_facts")
    .delete()
    .eq("user_id", userId)
    .eq("fact_id", factId);

  if (error) {
    throw error;
  }
};