import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, v as validate_slots, o as onMount, e as element, t as text, c as claim_element, a as children, b as claim_text, f as detach_dev, g as attr_dev, h as add_location, j as insert_dev, k as append_dev, l as set_data_dev, n as noop, m as create_component, p as claim_component, q as mount_component, r as transition_in, u as transition_out, w as destroy_component } from './client.46e92e86.js';

/* src/components/Code.svelte generated by Svelte v3.29.4 */
const file = "src/components/Code.svelte";

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
		Promise.all([import('./prismjs.94d74f27.js'), __inject_styles(["client-075fc7f6.css"])]).then(function(x) { return x[0]; }).then(function (n) { return n.p; });
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

import __inject_styles from './inject_styles.5607aec6.js';//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguOTYzYmU3YWMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL0NvZGUuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9pbmRleC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgZXhwb3J0IGxldCBsYW5ndWFnZTtcbiAgZXhwb3J0IGxldCBjb2RlO1xuXG4gIG9uTW91bnQoKCkgPT4ge1xuICAgIGltcG9ydChcIi4vcHJpc21qcy5qc1wiKTtcbiAgfSk7XG48L3NjcmlwdD5cblxuPHByZSBjbGFzcz1cImxpbmUtbnVtYmVyc1wiPjxjb2RlIGNsYXNzPVwibGFuZ3VhZ2Ute2xhbmd1YWdlfVwiPntjb2RlfTwvY29kZT48L3ByZT5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCBDb2RlIGZyb20gXCIuLi9jb21wb25lbnRzL0NvZGUuc3ZlbHRlXCI7XG4gIGxldCBjb2RlX3NhbXBsZSA9IGB2YXIgX3NlbGYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpXG5cdD8gd2luZG93ICAgLy8gaWYgaW4gYnJvd3NlclxuXHQ6IChcblx0XHQodHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGUpXG5cdFx0PyBzZWxmIC8vIGlmIGluIHdvcmtlclxuXHRcdDoge30gICAvLyBpZiBpbiBub2RlIGpzXG5cdCk7XG5gO1xuPC9zY3JpcHQ+XG5cbjxDb2RlIGxhbmd1YWdlPVwiamF2YXNjcmlwdFwiIGNvZGU9e2NvZGVfc2FtcGxlfSAvPlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztxQkFVNkQsR0FBSTs7Ozs7Ozs7eUNBQUosR0FBSTs7Ozs7OzZFQUFoQixHQUFROzs7Ozs7Ozs7OztvREFBSSxHQUFJOzt5R0FBaEIsR0FBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQVI1QyxRQUFRO09BQ1IsSUFBSTs7Q0FFZixPQUFPO3NCQUNFLHVCQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJDTVMsR0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQVZ2QyxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
