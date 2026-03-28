import { redirect } from "next/navigation";

/** Quem acessar /presentes cai na home, onde a lista está na âncora #presentes. */
export default function PresentesPage() {
  redirect("/#presentes");
}
