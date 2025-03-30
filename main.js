function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) => {
				typeof child == "object" ? child : createTextElement(child);
			}),
		},
	};
}
// function to create text elements for children
function createTextElement(text) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	};
}

function render(element, container) {
	// TODO implement render logic
	const dom =
		element.type == "TEXT_ELEMENT"
			? document.createTextElement("")
			: document.createElement(element.type);

	const isProperty = (key) => key !== "children";
	Object.keys(element.props)
		.filter(isProperty)
		.forEach((name) => {
			dom[name] = element.props.name;
		});

	element.props.children.forEach((child) => {
		render(child, dom);
	});

	container.appendChild(dom);
}

// Didact
const Didact = {
	createElement,
	render,
};

/** @jsx Didact.createElement */
const element = (
	<div id="foo">
		<a>bar</a>
		<b />
	</div>
);

const container = document.getElementById("root");

Didact.render(element, container);
