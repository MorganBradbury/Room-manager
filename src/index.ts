import "./events/setupCategory";
import "./events/voiceStateUpdate";

function logMemoryUsage() {
  const used = process.memoryUsage();
  const formatted = {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
  };
  console.log("📊 Memory usage:", formatted);
}

// Log every 30 seconds
setInterval(logMemoryUsage, 30_000);
