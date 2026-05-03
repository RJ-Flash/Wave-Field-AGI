async function run() {
  while (true) {
    console.log("Executing next step...");
    const res = await fetch('http://127.0.0.1:3000/api/execution-plan/execute-next', { method: 'POST' });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    if (data.error === "No pending steps" || !data.success) {
      break;
    }
  }
}
run();
