import { createCn } from "cn/engine";
import tables from "cn/tables";

// 仅定制前缀，复用上游完整的预编译规则；浏览器无需携带配置编译器。
export const cn = createCn(tables, undefined, { prefix: "ui" });
