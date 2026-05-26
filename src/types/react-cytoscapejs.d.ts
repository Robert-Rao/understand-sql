declare module "react-cytoscapejs" {
  import type cytoscape from "cytoscape";
  import type { ComponentProps } from "react";

  interface CytoscapeComponentProps extends Omit<ComponentProps<"div">, "cy"> {
    elements: cytoscape.ElementDefinition[];
    stylesheet?: cytoscape.Stylesheet | cytoscape.Stylesheet[];
    layout?: cytoscape.LayoutOptions;
    cy?: (cy: cytoscape.Core) => void;
    wheelSensitivity?: number;
    autoungrabify?: boolean;
    autounselectify?: boolean;
  }

  declare const CytoscapeComponent: React.FC<CytoscapeComponentProps>;
  export default CytoscapeComponent;
}
