import { Button } from "../types";
import { skip } from "./skip";
import { stop } from "./stop";

export const buttons: Map<string, Button> = new Map(
    // Add new buttons here
    [skip, stop]
        .map(button => [button.name, button])
);
