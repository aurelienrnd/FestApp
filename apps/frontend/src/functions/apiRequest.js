export async function apiRequest(path, init) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.error;
      const status = response.status;
      throw { message, status };
    }

    return { data, error: null };
  } catch (error) {
    const err = error;
    console.log(err?.message, err?.status);
    return { data: null, error: err };
  }
}
