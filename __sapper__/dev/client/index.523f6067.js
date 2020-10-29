import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, v as validate_slots, o as onMount, e as element, t as text, c as claim_element, a as children, b as claim_text, f as detach_dev, g as attr_dev, h as add_location, j as insert_dev, k as append_dev, l as set_data_dev, n as noop, m as create_component, p as claim_component, q as mount_component, r as transition_in, u as transition_out, w as destroy_component } from './client.74afbe91.js';

/* src/components/code/Code.svelte generated by Svelte v3.29.4 */
const file = "src/components/code/Code.svelte";

function create_fragment(ctx) {
	let pre;
	let code_1;
	let t;
	let code_1_class_value;

	const block = {
		c: function create() {
			pre = element("pre");
			code_1 = element("code");
			t = text(/*code*/ ctx[1]);
			this.h();
		},
		l: function claim(nodes) {
			pre = claim_element(nodes, "PRE", { class: true });
			var pre_nodes = children(pre);
			code_1 = claim_element(pre_nodes, "CODE", { class: true });
			var code_1_nodes = children(code_1);
			t = claim_text(code_1_nodes, /*code*/ ctx[1]);
			code_1_nodes.forEach(detach_dev);
			pre_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(code_1, "class", code_1_class_value = "language-" + /*language*/ ctx[0]);
			add_location(code_1, file, 10, 26, 177);
			attr_dev(pre, "class", "line-numbers");
			add_location(pre, file, 10, 0, 151);
		},
		m: function mount(target, anchor) {
			insert_dev(target, pre, anchor);
			append_dev(pre, code_1);
			append_dev(code_1, t);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*code*/ 2) set_data_dev(t, /*code*/ ctx[1]);

			if (dirty & /*language*/ 1 && code_1_class_value !== (code_1_class_value = "language-" + /*language*/ ctx[0])) {
				attr_dev(code_1, "class", code_1_class_value);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(pre);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Code", slots, []);
	let { language } = $$props;
	let { code } = $$props;

	onMount(() => {
		Promise.all([import('./prismjs.87d3dbf7.js'), __inject_styles(["client-ac6093b3.css"])]).then(function(x) { return x[0]; }).then(function (n) { return n.p; });
	});

	const writable_props = ["language", "code"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Code> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("language" in $$props) $$invalidate(0, language = $$props.language);
		if ("code" in $$props) $$invalidate(1, code = $$props.code);
	};

	$$self.$capture_state = () => ({ onMount, language, code });

	$$self.$inject_state = $$props => {
		if ("language" in $$props) $$invalidate(0, language = $$props.language);
		if ("code" in $$props) $$invalidate(1, code = $$props.code);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [language, code];
}

class Code extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { language: 0, code: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Code",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*language*/ ctx[0] === undefined && !("language" in props)) {
			console.warn("<Code> was created without expected prop 'language'");
		}

		if (/*code*/ ctx[1] === undefined && !("code" in props)) {
			console.warn("<Code> was created without expected prop 'code'");
		}
	}

	get language() {
		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set language(value) {
		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get code() {
		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set code(value) {
		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/routes/index.svelte generated by Svelte v3.29.4 */

function create_fragment$1(ctx) {
	let code;
	let current;

	code = new Code({
			props: {
				language: "javascript",
				code: /*code_sample*/ ctx[0]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(code.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(code.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(code, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(code.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(code.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(code, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Routes", slots, []);

	let code_sample = `var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);
`;

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Routes> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Code, code_sample });

	$$self.$inject_state = $$props => {
		if ("code_sample" in $$props) $$invalidate(0, code_sample = $$props.code_sample);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [code_sample];
}

class Routes extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Routes",
			options,
			id: create_fragment$1.name
		});
	}
}

export default Routes;

import __inject_styles from './inject_styles.5607aec6.js';//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguNTIzZjYwNjcuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL2NvZGUvQ29kZS5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvcm91dGVzL2luZGV4LnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBleHBvcnQgbGV0IGxhbmd1YWdlO1xuICBleHBvcnQgbGV0IGNvZGU7XG5cbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgaW1wb3J0KFwiLi9wcmlzbWpzLmpzXCIpO1xuICB9KTtcbjwvc2NyaXB0PlxuXG48cHJlIGNsYXNzPVwibGluZS1udW1iZXJzXCI+PGNvZGUgY2xhc3M9XCJsYW5ndWFnZS17bGFuZ3VhZ2V9XCI+e2NvZGV9PC9jb2RlPjwvcHJlPlxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0IENvZGUgZnJvbSBcIi4uL2NvbXBvbmVudHMvY29kZS9Db2RlLnN2ZWx0ZVwiO1xuICBsZXQgY29kZV9zYW1wbGUgPSBgdmFyIF9zZWxmID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKVxuXHQ/IHdpbmRvdyAgIC8vIGlmIGluIGJyb3dzZXJcblx0OiAoXG5cdFx0KHR5cGVvZiBXb3JrZXJHbG9iYWxTY29wZSAhPT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlKVxuXHRcdD8gc2VsZiAvLyBpZiBpbiB3b3JrZXJcblx0XHQ6IHt9ICAgLy8gaWYgaW4gbm9kZSBqc1xuXHQpO1xuYDtcbjwvc2NyaXB0PlxuXG48Q29kZSBsYW5ndWFnZT1cImphdmFzY3JpcHRcIiBjb2RlPXtjb2RlX3NhbXBsZX0gLz5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7cUJBVTZELEdBQUk7Ozs7Ozs7O3lDQUFKLEdBQUk7Ozs7Ozs2RUFBaEIsR0FBUTs7Ozs7Ozs7Ozs7b0RBQUksR0FBSTs7eUdBQWhCLEdBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FSNUMsUUFBUTtPQUNSLElBQUk7O0NBRWYsT0FBTztzQkFDRSx1QkFBYzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQ01TLEdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FWdkMsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
