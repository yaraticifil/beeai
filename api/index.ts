import { appPromise } from "../server/index";

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
