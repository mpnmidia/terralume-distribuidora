// Script gerador de SQL e lista de imagens a partir de um CSV
// Uso:
//   node gerar_sql_produtos.cjs caminho/do/arquivo.csv > saida.txt

const fs = require("fs");
const path = require("path");

// CONFIGURAÇÃO: ajuste aqui os nomes das colunas conforme o cabeçalho do seu CSV
// Exemplo típico:
//   const COL_NAME = "NOME_PRODUTO";
//   const COL_CODE = "CODIGO_PRODUTO";
//   const COL_UNIT = "UNIDADE";
const COL_NAME = "NOME_PRODUTO";      // TODO: troque para o nome exato da coluna de nome
const COL_CODE = "CODIGO_PRODUTO";    // TODO: troque para o nome exato da coluna de código
const COL_UNIT = "UNIDADE";           // TODO: troque se tiver coluna de unidade (cx, pct, etc)

const COMPANY_ID = "6d6212b8-3ff2-4510-8572-04e1399f8534";
const DEFAULT_CATEGORY = "Doces e Balas"; // Ajuste se quiser outra categoria padrão
const DEFAULT_PRICE = 0;
const DEFAULT_PROMO = 0;

if (process.argv.length < 3) {
  console.error("Uso: node gerar_sql_produtos.cjs caminho/do/arquivo.csv");
  process.exit(1);
}

const csvPath = process.argv[2];

if (!fs.existsSync(csvPath)) {
  console.error("Arquivo CSV não encontrado:", csvPath);
  process.exit(1);
}

const content = fs.readFileSync(csvPath, "utf8");

// Detecta separador ; ou ,
let separator = ";";
if (content.includes(";")) {
  separator = ";";
} else if (content.includes(",")) {
  separator = ",";
}

const lines = content
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

if (lines.length === 0) {
  console.error("CSV vazio.");
  process.exit(1);
}

const header = lines[0].split(separator).map((h) => h.trim().replace(/"/g, ""));

function idx(colName) {
  const i = header.findIndex(
    (h) => h.toLowerCase() === colName.toLowerCase()
  );
  if (i === -1) {
    console.error(
      `Coluna "${colName}" não encontrada no cabeçalho. Cabeçalho lido:`,
      header
    );
  }
  return i;
}

const idxName = idx(COL_NAME);
const idxCode = idx(COL_CODE);
const idxUnit = idx(COL_UNIT);

if (idxName === -1 || idxCode === -1) {
  console.error("Ajuste as constantes COL_NAME e COL_CODE no topo do script.");
  process.exit(1);
}

const products = [];

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(separator).map((v) => v.trim());

  const rawName = parts[idxName] || "";
  const rawCode = parts[idxCode] || "";
  const rawUnit = idxUnit >= 0 ? parts[idxUnit] || "" : "cx";

  if (!rawCode) continue; // sem código não cadastramos

  const name = rawName.replace(/"/g, "'");
  const sku = rawCode;
  const unit = rawUnit || "cx";

  products.push({
    name,
    sku,
    unit,
  });
}

// Gera SQL
console.log("/* === SQL PARA TABELA products (UPSERT) === */");
console.log("INSERT INTO products (");
console.log("  company_id,");
console.log("  name,");
console.log("  sku,");
console.log("  category,");
console.log("  unit,");
console.log("  description,");
console.log("  unit_price,");
console.log("  promo_price,");
console.log("  offer_is_active,");
console.log("  image_url");
console.log(") VALUES");

products.forEach((p, index) => {
  const isLast = index === products.length - 1;
  const line =
    "  (" +
    `'${COMPANY_ID}', ` +
    `'${p.name}', ` +
    `'${p.sku}', ` +
    `'${DEFAULT_CATEGORY}', ` +
    `'${p.unit}', ` +
    `'${p.name}', ` + // descrição = nome por enquanto
    `${DEFAULT_PRICE}, ` +
    `${DEFAULT_PROMO}, ` +
    `false, ` +
    `NULL` +
    ")" +
    (isLast ? "" : ",");

  console.log(line);
});

console.log("ON CONFLICT (company_id, sku) DO UPDATE SET");
console.log("  name            = EXCLUDED.name,");
console.log("  category        = EXCLUDED.category,");
console.log("  unit            = EXCLUDED.unit,");
console.log("  description     = EXCLUDED.description,");
console.log("  unit_price      = EXCLUDED.unit_price,");
console.log("  promo_price     = EXCLUDED.promo_price,");
console.log("  offer_is_active = EXCLUDED.offer_is_active;");
console.log("");
console.log("/* === LISTA NUMERADA PARA IMAGENS (bucket produtos_terra_lume) === */");

products.forEach((p, index) => {
  console.log(`${index + 1}) SKU: ${p.sku}`);
  console.log(`   Nome: ${p.name}`);
  console.log(
    `   Caminho no bucket: produtos_terra_lume/${p.sku}.jpg`
  );
  console.log("");
});
