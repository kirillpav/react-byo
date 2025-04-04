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

function createDom(fiber) {
	const dom =
		fiber.type == "TEXT_ELEMENT"
			? document.createTextElement("")
			: document.createElement(fiber.type);

	const isProperty = (key) => key !== "children";
	Object.keys(fiber.props)
		.filter(isProperty)
		.forEach((name) => {
			dom[name] = fiber.props[name];
		});

	return dom;
}

function commitRoot() {
	commitWork(wipRoot.child);
	wipRoot = null;
}

function commitWork(fiber) {
	if (!fiber) {
		return;
	}

	const domParent = fiber.parent.dom;
	domParent.appendChild(fiber.dom);
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function render(element, container) {
	// TODO implement render logic
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
	};

	nextUnitOfWork = wipRoot;
}

// Setting up multithreading
let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}

	requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}

	const elements = fiber.dom.children;

	let index = 0;
	let prevSibling = null;

	while (index != elements.length) {
		const element = elements[index];

		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null,
		};

		if (index == 0) {
			fiber.child = newFiber;
		} else {
			fiber.sibling = newFiber;
		}

		prevSibling = newSibling;
		index++;
	}

	if (fiber.child) {
		return fiber.child;
	}

	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		} else {
			return nextFiber.parent;
		}
	}
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
