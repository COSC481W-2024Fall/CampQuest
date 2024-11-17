import {render, screen} from "@testing-library/react"
import CampView from "./ViewCamp"

test('on inital render, the page displays loading camp details',()=>{
    render(<CampView />);
    //screen.debug();
    expect(screen.getByRole ('loading'))
})