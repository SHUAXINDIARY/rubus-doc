import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, x as create_slot, v as validate_slots, e as element, c as claim_element, a as children, f as detach_dev, g as attr_dev, E as toggle_class, h as add_location, j as insert_dev, y as update_slot, r as transition_in, u as transition_out, m as create_component, p as claim_component, q as mount_component, w as destroy_component, t as text, b as claim_text } from './client.a9e61af1.js';

/* node_modules/@rubus/rubus/src/packages/Typography/TypographyHeading.svelte generated by Svelte v3.29.4 */

const file = "node_modules/@rubus/rubus/src/packages/Typography/TypographyHeading.svelte";

function create_fragment(ctx) {
	let h1;
	let h1_class_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	const block = {
		c: function create() {
			h1 = element("h1");
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			h1 = claim_element(nodes, "H1", { class: true });
			var h1_nodes = children(h1);
			if (default_slot) default_slot.l(h1_nodes);
			h1_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(h1, "class", h1_class_value = "spectrum-Heading spectrum-Heading--" + /*scale*/ ctx[0] + "  spectrum-Heading--" + /*thickness*/ ctx[2]);
			toggle_class(h1, "spectrum-Heading--serif", /*isSerif*/ ctx[1]);
			add_location(h1, file, 20, 0, 455);
		},
		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);

			if (default_slot) {
				default_slot.m(h1, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 8) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
				}
			}

			if (!current || dirty & /*scale, thickness*/ 5 && h1_class_value !== (h1_class_value = "spectrum-Heading spectrum-Heading--" + /*scale*/ ctx[0] + "  spectrum-Heading--" + /*thickness*/ ctx[2])) {
				attr_dev(h1, "class", h1_class_value);
			}

			if (dirty & /*scale, thickness, isSerif*/ 7) {
				toggle_class(h1, "spectrum-Heading--serif", /*isSerif*/ ctx[1]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h1);
			if (default_slot) default_slot.d(detaching);
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
	validate_slots("TypographyHeading", slots, ['default']);
	let { scale = "M" } = $$props;
	let { isSerif = false } = $$props;
	let { thickness = "default" } = $$props;
	const writable_props = ["scale", "isSerif", "thickness"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TypographyHeading> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("scale" in $$props) $$invalidate(0, scale = $$props.scale);
		if ("isSerif" in $$props) $$invalidate(1, isSerif = $$props.isSerif);
		if ("thickness" in $$props) $$invalidate(2, thickness = $$props.thickness);
		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({ scale, isSerif, thickness });

	$$self.$inject_state = $$props => {
		if ("scale" in $$props) $$invalidate(0, scale = $$props.scale);
		if ("isSerif" in $$props) $$invalidate(1, isSerif = $$props.isSerif);
		if ("thickness" in $$props) $$invalidate(2, thickness = $$props.thickness);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [scale, isSerif, thickness, $$scope, slots];
}

class TypographyHeading extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { scale: 0, isSerif: 1, thickness: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "TypographyHeading",
			options,
			id: create_fragment.name
		});
	}

	get scale() {
		throw new Error("<TypographyHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set scale(value) {
		throw new Error("<TypographyHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isSerif() {
		throw new Error("<TypographyHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isSerif(value) {
		throw new Error("<TypographyHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get thickness() {
		throw new Error("<TypographyHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set thickness(value) {
		throw new Error("<TypographyHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/routes/docs/csstokens/color/index.svelte generated by Svelte v3.29.4 */

// (5:0) <TypographyHeading scale="XL">
function create_default_slot(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("颜色");
		},
		l: function claim(nodes) {
			t = claim_text(nodes, "颜色");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(5:0) <TypographyHeading scale=\\\"XL\\\">",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let typographyheading;
	let current;

	typographyheading = new TypographyHeading({
			props: {
				scale: "XL",
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(typographyheading.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(typographyheading.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(typographyheading, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const typographyheading_changes = {};

			if (dirty & /*$$scope*/ 1) {
				typographyheading_changes.$$scope = { dirty, ctx };
			}

			typographyheading.$set(typographyheading_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(typographyheading.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(typographyheading.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(typographyheading, detaching);
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
	validate_slots("Color", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Color> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ TypographyHeading });
	return [];
}

class Color extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Color",
			options,
			id: create_fragment$1.name
		});
	}
}

export default Color;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguNDMyMDIzMmMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL1R5cG9ncmFwaHkvVHlwb2dyYXBoeUhlYWRpbmcuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIC8qKlxuICAgKiBTZXQgSGVhZGluZyBzY2FsZSBzcGVjaWZpY2F0aW9uc1xuICAgKiBAdHlwZSB7XCJYWFNcIiB8IFwiWFNcIiB8IFwiU1wiIHwgXCJNXCIgfCBcIkxcIiB8IFwiWExcIiB8IFwiWFhMXCIgfCBcIlhYWExcIn0gW3NjYWxlID0gXCJNXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHNjYWxlID0gXCJNXCI7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gdXNlIHNlcmlmIGZvbnQgZmFtaWx5IGluIHRoZSBjb250ZXh0XG4gICAqIEB0eXBlIHtib29sZWFufSBbaXNTZXJpZiA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc1NlcmlmID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgZm9udCB3ZWlnaHRcbiAgICogQHR5cGUge1wiaGVhdnlcIiB8IFwibGlnaHRcIiB8IFwiZGVmYXVsdFwiIH0gW3RoaWNrbmVzcyA9IFwiZGVmYXVsdFwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCB0aGlja25lc3MgPSBcImRlZmF1bHRcIjtcbjwvc2NyaXB0PlxuXG48aDFcbiAgY2xhc3M9XCJzcGVjdHJ1bS1IZWFkaW5nIHNwZWN0cnVtLUhlYWRpbmctLXtzY2FsZX0gIHNwZWN0cnVtLUhlYWRpbmctLXt0aGlja25lc3N9XCJcbiAgY2xhc3M6c3BlY3RydW0tSGVhZGluZy0tc2VyaWY9e2lzU2VyaWZ9PlxuICA8c2xvdCAvPlxuPC9oMT5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEZBcUI2QyxHQUFLLDZDQUFzQixHQUFTOzJEQUNoRCxHQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRJQURLLEdBQUssNkNBQXNCLEdBQVM7Ozs7OzREQUNoRCxHQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWpCM0IsS0FBSyxHQUFHLEdBQUc7T0FNWCxPQUFPLEdBQUcsS0FBSztPQU1mLFNBQVMsR0FBRyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
