import { render, screen } from "@testing-library/react";
import { Keycap } from "@/components/game/Keycap";

describe("Keycap", () => {
  it("renders a semantic keyboard hint", () => {
    render(<Keycap wide>SPACE</Keycap>);

    const key = screen.getByText("SPACE");
    expect(key.tagName).toBe("KBD");
    expect(key).toHaveClass("min-w-12");
  });
});
