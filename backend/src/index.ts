import { app } from './app';
import { PORT } from './config/env';

app.listen(PORT, () => {
  console.log(`CloudMart API ready on port ${PORT}`);
});
