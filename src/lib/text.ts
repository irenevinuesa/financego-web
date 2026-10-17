/** Lower-case, accent-free text for matching (search, filters, interview checks). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[−–—]/g, "-");
}
