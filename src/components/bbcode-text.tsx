"use client";

interface BBCodeTextProps {
  text: string;
  className?: string;
}

export function BBCodeText({ text, className = "" }: BBCodeTextProps) {
  if (!text) return null;

  // 将 BBCode 转换为 HTML
  let html = text
    .replace(/\[gold\](.*?)\[\/gold\]/g, '<span class="text-amber-400">$1</span>')
    .replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="text-blue-400">$1</span>')
    .replace(/\[red\](.*?)\[\/red\]/g, '<span class="text-red-400">$1</span>')
    .replace(/\[purple\](.*?)\[\/purple\]/g, '<span class="text-purple-400">$1</span>')
    .replace(/\[green\](.*?)\[\/green\]/g, '<span class="text-green-400">$1</span>')
    .replace(/\[b\](.*?)\[\/b\]/g, "<strong>$1</strong>")
    .replace(/\[i\](.*?)\[\/i\]/g, "<em>$1</em>")
    .replace(/\[color=([^\]]+)\](.*?)\[\/color\]/g, '<span style="color:$1">$2</span>')
    .replace(/\[font_size=(\d+)\](.*?)\[\/font_size\]/g, '<span style="font-size:${1}px">$2</span>')
    .replace(/\n/g, "<br />");

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
