import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Read locale from cookie set by language switcher
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const locale = cookieLocale === "hi" ? "hi" : "en";

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
