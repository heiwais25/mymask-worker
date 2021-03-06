import { IBullSets } from "./bull";
import { RegularFetchSubscriber } from "../subscribers/RegularFetchSubscriber";
import logger from "./logger";
import configs from "../configs";

export default ({ regularFetchQueue }: IBullSets) => {
  regularFetchQueue.queue.process(async (job, done) => {
    try {
      await new RegularFetchSubscriber().start();
      done(null);
    } catch (err) {
      logger.error(err);
      done(new Error(err));
    }
  });

  // Description in here https://cronexpressiondescriptor.azurewebsites.net/?expression=0+*%2F5+6-22+%3F+*+*&locale=en
  regularFetchQueue.queue.add(
    {},
    {
      attempts: configs.bull.attempts,
      backoff: configs.bull.backoff,
      repeat: { cron: "0 */5 6-22 ? * *" }
    }
  );
};
