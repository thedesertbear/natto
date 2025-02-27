import { Args } from "grimoire-kolmafia";
import { write } from "kolmafia";
import {
  ComponentHtml,
  ComponentSetting,
  generateHTML,
  handleApiRequest,
  RelayPage,
} from "mafia-shared-relay";
import { args } from "./args";
import { checkPerms, checkReqs } from "./tasks/sim";

function convertArgsToHtml(): RelayPage[] {
  const metadata = Args.getMetadata(args);
  const sim: ComponentHtml = {
    type: "html",
    data: checkReqs(false),
  };
  const simPerms: ComponentHtml = {
    type: "html",
    data: checkPerms(false),
  };

  const pages: RelayPage[] = [
    { page: metadata.options.defaultGroupName ?? "Options", components: [] },
    { page: "Requirements", components: [sim] },
    { page: "Perms", components: [simPerms] },
  ];

  metadata.traverse(
    (key, name: string) => {
      if (key.setting === "" || key.hidden) return;

      const component: ComponentSetting = {
        type: "string",
        name: key.key ?? name,
        description: key.help || "No Description Provided",
        preference: key.setting ?? `${metadata.scriptName}_${key.key ?? name}`,
        default: "default" in key ? `${key["default"]}` : undefined,
      };

      if (key.valueHelpName === "FLAG" || key.valueHelpName === "BOOLEAN") {
        component.type = "boolean";
      } else if (key.options !== undefined) {
        component.type = "dropdown";
        component.dropdown = key.options.map(([k, desc]) => {
          return { display: desc ?? k, value: k };
        });
      }
      pages[0].components.push(component);
    },
    (group, name: string) => {
      pages.push({ page: name, components: [] });
    }
  );

  pages
    .filter((p) => p.components.length > 0)
    .forEach((p) => {
      const html: ComponentHtml = {
        type: "html",
        data: `<h1 style="text-align: center;">Natto ${
          p.page
        }</h1><div class="meat">${`<div><svg xmlns="http://www.w3.org/2000/svg" width="75px" height="75px" viewBox="0 0 191.386 191.386" style="enable-background:new 0 0 191.386 191.386" xml:space="preserve"><path d="M191.192 43.137a26.009 26.009 0 0 0-4.721-14.391c-5.474-7.834-13.97-12.104-23.691-11.534-12.158.756-27.56 5.953-42.455 10.975l-7.405 2.48c-6.121 2.036-11.972 2.326-19.38 2.695-9.618.479-21.574 1.068-38.429 5.941-25.421 7.364-42.966 20.081-50.72 36.764C1.508 82.253.151 88.919.105 95.745L0 95.843v20.67c-.038 7.466 1.611 15.148 4.931 22.639 8.893 19.993 34.636 35.072 59.889 35.072 17.61 0 33.963-6.977 47.293-20.185 11.67-11.554 15.861-19 20.33-26.878 3.09-5.458 6.255-11.085 12.451-18.631 5.306-6.47 12.098-9.632 19.287-12.978 10.184-4.743 20.715-9.648 25.916-23.888a21.472 21.472 0 0 0 1.238-8.299l.049-20.025c-.059-.095-.143-.143-.192-.203zM13.762 80.426c6.464-13.896 21.754-24.682 44.22-31.19 15.693-4.546 26.507-5.079 36.059-5.558 7.875-.385 14.683-.729 22.129-3.206l7.454-2.495c14.258-4.811 29.001-9.79 39.793-10.458l1.082-.03c5.398 0 10.304 2.615 13.493 7.175 2.85 4.076 3.763 8.966 2.385 12.757-3.735 10.211-11.157 13.68-20.578 18.062-7.542 3.519-16.098 7.506-22.906 15.797-6.745 8.233-10.167 14.262-13.461 20.111-4.256 7.546-7.951 14.062-18.605 24.61-11.353 11.261-25.183 17.195-40.014 17.195-23.52 0-44.12-14.719-50.438-28.934-3.641-8.216-6.704-20.725-.613-33.836z"/><path d="M64.821 132.848c12.216 0 23.229-4.77 32.734-14.207 9.618-9.514 12.82-15.166 16.86-22.319 3.357-5.949 7.152-12.671 14.49-21.61 8.3-10.113 18.422-14.824 26.541-18.607 9.795-4.57 13.145-6.524 15.217-12.232.092-.399-.133-1.859-1.143-3.288-.721-1.036-2.344-2.771-5.013-2.771-9.875.605-23.953 5.354-37.55 9.946l-7.514 2.519c-8.801 2.921-16.595 3.308-24.862 3.723-9.021.447-19.194.958-33.717 5.158-19.515 5.65-32.563 14.504-37.737 25.612-4.45 9.588-2.078 19.045.701 25.284 4.872 10.965 21.933 22.792 40.993 22.792zm-.916-57.371c13.469 0 24.389 7.662 24.389 17.132 0 9.452-10.92 17.127-24.389 17.127-13.481 0-24.403-7.676-24.403-17.127 0-9.47 10.922-17.132 24.403-17.132z"/></svg></div>`.repeat(
          7
        )}</div>`,
      };
      p.components.splice(0, 0, html);
    });

  return pages.filter((page) => page.components.length > 0);
}

export function main() {
  if (handleApiRequest()) return;

  write(
    generateHTML(convertArgsToHtml(), {
      css: ".meat,.meat div{position:absolute}.meat{width:100%;height:100%;top:0;left:0;overflow:hidden;opacity: 10%;z-index: 10;pointer-events: none}.meat div{display:block}.meat div:first-child{left:20%;animation:15s linear -2s infinite fall}.meat div:nth-child(2){left:70%;animation:15s linear -4s infinite fall}.meat div:nth-child(3){left:10%;animation:20s linear -7s infinite fall}.meat div:nth-child(4){left:50%;animation:18s linear -5s infinite fall}.meat div:nth-child(5){left:85%;animation:14s linear -5s infinite fall}.meat div:nth-child(6){left:15%;animation:16s linear -10s infinite fall}.meat div:nth-child(7){left:90%;animation:15s linear -4s infinite fall}@keyframes fall{0%{opacity:1;top:-10%;transform:translateX (20px) rotate(0)}20%{opacity:.8;transform:translateX (-20px) rotate(45deg)}40%{transform:translateX (-20px) rotate(90deg)}60%{transform:translateX (-20px) rotate(135deg)}80%{transform:translateX (-20px) rotate(180deg)}100%{top:110%;transform:translateX (-20px) rotate(225deg)}}",
    })
  );
}
