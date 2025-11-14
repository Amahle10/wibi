import { Redirect } from "expo-router";

export default function Index() {
  // When the app loads, immediately redirect to /login
  return <Redirect href="/login" />;
}
