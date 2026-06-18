async function main() {
  console.log("Seed skipped — сотрудников добавляйте через админку");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
