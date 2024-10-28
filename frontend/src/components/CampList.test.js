import {render, screen} from "@testing-library/react"
import CampList from "./CampList";

test('on initial render, the prev button is disabled', ()=>{
    render(<CampList />);
    expect(screen.getByRole('button', {name: "<"})).toBeDisabled();
})