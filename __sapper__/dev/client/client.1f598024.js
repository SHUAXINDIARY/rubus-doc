function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props)
        if (!keys.has(k) && k[0] !== '$')
            rest[k] = props[k];
    return rest;
}
function set_store_value(store, ret, value = ret) {
    store.set(value);
    return ret;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value') {
            node.value = node[key] = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function set_svg_attributes(node, attributes) {
    for (const key in attributes) {
        attr(node, key, attributes[key]);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function claim_element(nodes, name, attributes, svg) {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.nodeName === name) {
            let j = 0;
            const remove = [];
            while (j < node.attributes.length) {
                const attribute = node.attributes[j++];
                if (!attributes[attribute.name]) {
                    remove.push(attribute.name);
                }
            }
            for (let k = 0; k < remove.length; k++) {
                node.removeAttribute(remove[k]);
            }
            return nodes.splice(i, 1)[0];
        }
    }
    return svg ? svg_element(name) : element(name);
}
function claim_text(nodes, data) {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.nodeType === 3) {
            node.data = '' + data;
            return nodes.splice(i, 1)[0];
        }
    }
    return text(data);
}
function claim_space(nodes) {
    return claim_text(nodes, ' ');
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
function query_selector_all(selector, parent = document.body) {
    return Array.from(parent.querySelectorAll(selector));
}
class HtmlTag {
    constructor(anchor = null) {
        this.a = anchor;
        this.e = this.n = null;
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            this.e = element(target.nodeName);
            this.t = target;
            this.h(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function create_component(block) {
    block && block.c();
}
function claim_component(block, parent_nodes) {
    block && block.l(parent_nodes);
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev('SvelteDOMRemove', { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
    else
        dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.wholeText === data)
        return;
    dispatch_dev('SvelteDOMSetData', { node: text, data });
    text.data = data;
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error("'target' is a required option");
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn('Component was already destroyed'); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const CONTEXT_KEY = {};

/* node_modules/@rubus/svelte-spectrum-icons-ui/src/AlertMedium.svelte generated by Svelte v3.29.4 */
const file = "node_modules/@rubus/svelte-spectrum-icons-ui/src/AlertMedium.svelte";

// (51:26) 
function create_if_block_1(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M8.564 1.289L.2 16.256A.5.5 0 00.636 17h16.728a.5.5 0 00.436-.744L9.436 1.289a.5.5 0 00-.872 0zM10 14.75a.25.25\n      0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-1.5a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zm0-3a.25.25 0\n      01-.25.25h-1.5a.25.25 0 01-.25-.25v-6a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25z");
			add_location(path_1, file, 51, 4, 1390);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding_1*/ ctx[11](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding_1*/ ctx[11](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(51:26) ",
		ctx
	});

	return block;
}

// (45:2) {#if scale === 'L'}
function create_if_block(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M10.563 2.206l-9.249 16.55a.5.5 0 00.436.744h18.5a.5.5 0 00.436-.744l-9.251-16.55a.5.5 0 00-.872 0zm1.436\n      15.044a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-1.5a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zm0-3.5a.25.25 0\n      01-.25.25h-1.5a.25.25 0 01-.25-.25v-6a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25z");
			add_location(path_1, file, 45, 4, 1006);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding*/ ctx[10](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding*/ ctx[10](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(45:2) {#if scale === 'L'}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let svg;
	let svg_width_value;
	let svg_height_value;
	let svg_class_value;

	function select_block_type(ctx, dirty) {
		if (/*scale*/ ctx[0] === "L") return create_if_block;
		if (/*scale*/ ctx[0] === "M") return create_if_block_1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type && current_block_type(ctx);

	let svg_levels = [
		{ "aria-label": /*ariaLabel*/ ctx[4] },
		/*$$restProps*/ ctx[9],
		{
			width: svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]
		},
		{
			height: svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]
		},
		{ fill: "currentColor" },
		{
			class: svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]
		}
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	const block = {
		c: function create() {
			svg = svg_element("svg");
			if (if_block) if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					"aria-label": true,
					width: true,
					height: true,
					fill: true,
					class: true
				},
				1
			);

			var svg_nodes = children(svg);
			if (if_block) if_block.l(svg_nodes);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			set_svg_attributes(svg, svg_data);
			add_location(svg, file, 37, 0, 810);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			if (if_block) if_block.m(svg, null);
		},
		p: function update(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if (if_block) if_block.d(1);
				if_block = current_block_type && current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(svg, null);
				}
			}

			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				dirty & /*ariaLabel*/ 16 && { "aria-label": /*ariaLabel*/ ctx[4] },
				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9],
				dirty & /*width, sw*/ 68 && svg_width_value !== (svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]) && { width: svg_width_value },
				dirty & /*height, sh*/ 136 && svg_height_value !== (svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]) && { height: svg_height_value },
				{ fill: "currentColor" },
				dirty & /*className*/ 2 && svg_class_value !== (svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]) && { class: svg_class_value }
			]));
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);

			if (if_block) {
				if_block.d();
			}
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
	const omit_props_names = ["scale","className","width","height","ariaLabel"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("AlertMedium", slots, []);
	let { scale = "M" } = $$props;
	let { className = "" } = $$props;
	let { width = "" } = $$props;
	let { height = "" } = $$props;
	let { ariaLabel = "AlertMedium" } = $$props;
	let path;
	let sw;
	let sh;
	let flag = 14;

	onMount(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}
	});

	afterUpdate(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}

		if (!scale || scale == "M") {
			let rootClassName = document && document.documentElement.className;

			if (rootClassName && rootClassName.indexOf("spectrum--large") != -1) {
				$$invalidate(0, scale = "L");
			} else {
				$$invalidate(0, scale = "M");
			}
		}
	});

	function path_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	function path_1_binding_1($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("scale" in $$new_props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$new_props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$new_props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$new_props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$new_props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		onMount,
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag
	});

	$$self.$inject_state = $$new_props => {
		if ("scale" in $$props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
		if ("path" in $$props) $$invalidate(5, path = $$new_props.path);
		if ("sw" in $$props) $$invalidate(6, sw = $$new_props.sw);
		if ("sh" in $$props) $$invalidate(7, sh = $$new_props.sh);
		if ("flag" in $$props) $$invalidate(8, flag = $$new_props.flag);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag,
		$$restProps,
		path_1_binding,
		path_1_binding_1
	];
}

class AlertMedium extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance, create_fragment, safe_not_equal, {
			scale: 0,
			className: 1,
			width: 2,
			height: 3,
			ariaLabel: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "AlertMedium",
			options,
			id: create_fragment.name
		});
	}

	get scale() {
		throw new Error("<AlertMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set scale(value) {
		throw new Error("<AlertMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get className() {
		throw new Error("<AlertMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set className(value) {
		throw new Error("<AlertMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<AlertMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<AlertMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<AlertMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<AlertMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaLabel() {
		throw new Error("<AlertMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaLabel(value) {
		throw new Error("<AlertMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/@rubus/svelte-spectrum-icons-ui/src/CheckmarkMedium.svelte generated by Svelte v3.29.4 */
const file$1 = "node_modules/@rubus/svelte-spectrum-icons-ui/src/CheckmarkMedium.svelte";

// (50:26) 
function create_if_block_1$1(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M4.5 10a1.022 1.022 0 01-.799-.384l-2.488-3a1 1 0 011.576-1.233L4.5 7.376l4.712-5.991a1 1 0 111.576 1.23l-5.51\n      7A.978.978 0 014.5 10z");
			add_location(path_1, file$1, 50, 4, 1202);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding_1*/ ctx[11](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding_1*/ ctx[11](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(50:26) ",
		ctx
	});

	return block;
}

// (45:2) {#if scale === 'L'}
function create_if_block$1(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M6 14a1 1 0 01-.789-.385l-4-5a1 1 0 111.577-1.23L6 11.376l7.213-8.99a1 1 0 111.576 1.23l-8 10a1 1 0\n      01-.789.384z");
			add_location(path_1, file$1, 45, 4, 1010);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding*/ ctx[10](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding*/ ctx[10](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(45:2) {#if scale === 'L'}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let svg;
	let svg_width_value;
	let svg_height_value;
	let svg_class_value;

	function select_block_type(ctx, dirty) {
		if (/*scale*/ ctx[0] === "L") return create_if_block$1;
		if (/*scale*/ ctx[0] === "M") return create_if_block_1$1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type && current_block_type(ctx);

	let svg_levels = [
		{ "aria-label": /*ariaLabel*/ ctx[4] },
		/*$$restProps*/ ctx[9],
		{
			width: svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]
		},
		{
			height: svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]
		},
		{ fill: "currentColor" },
		{
			class: svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]
		}
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	const block = {
		c: function create() {
			svg = svg_element("svg");
			if (if_block) if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					"aria-label": true,
					width: true,
					height: true,
					fill: true,
					class: true
				},
				1
			);

			var svg_nodes = children(svg);
			if (if_block) if_block.l(svg_nodes);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			set_svg_attributes(svg, svg_data);
			add_location(svg, file$1, 37, 0, 814);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			if (if_block) if_block.m(svg, null);
		},
		p: function update(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if (if_block) if_block.d(1);
				if_block = current_block_type && current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(svg, null);
				}
			}

			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				dirty & /*ariaLabel*/ 16 && { "aria-label": /*ariaLabel*/ ctx[4] },
				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9],
				dirty & /*width, sw*/ 68 && svg_width_value !== (svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]) && { width: svg_width_value },
				dirty & /*height, sh*/ 136 && svg_height_value !== (svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]) && { height: svg_height_value },
				{ fill: "currentColor" },
				dirty & /*className*/ 2 && svg_class_value !== (svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]) && { class: svg_class_value }
			]));
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);

			if (if_block) {
				if_block.d();
			}
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
	const omit_props_names = ["scale","className","width","height","ariaLabel"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("CheckmarkMedium", slots, []);
	let { scale = "M" } = $$props;
	let { className = "" } = $$props;
	let { width = "" } = $$props;
	let { height = "" } = $$props;
	let { ariaLabel = "CheckmarkMedium" } = $$props;
	let path;
	let sw;
	let sh;
	let flag = 14;

	onMount(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}
	});

	afterUpdate(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}

		if (!scale || scale == "M") {
			let rootClassName = document && document.documentElement.className;

			if (rootClassName && rootClassName.indexOf("spectrum--large") != -1) {
				$$invalidate(0, scale = "L");
			} else {
				$$invalidate(0, scale = "M");
			}
		}
	});

	function path_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	function path_1_binding_1($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("scale" in $$new_props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$new_props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$new_props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$new_props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$new_props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		onMount,
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag
	});

	$$self.$inject_state = $$new_props => {
		if ("scale" in $$props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
		if ("path" in $$props) $$invalidate(5, path = $$new_props.path);
		if ("sw" in $$props) $$invalidate(6, sw = $$new_props.sw);
		if ("sh" in $$props) $$invalidate(7, sh = $$new_props.sh);
		if ("flag" in $$props) $$invalidate(8, flag = $$new_props.flag);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag,
		$$restProps,
		path_1_binding,
		path_1_binding_1
	];
}

class CheckmarkMedium extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
			scale: 0,
			className: 1,
			width: 2,
			height: 3,
			ariaLabel: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "CheckmarkMedium",
			options,
			id: create_fragment$1.name
		});
	}

	get scale() {
		throw new Error("<CheckmarkMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set scale(value) {
		throw new Error("<CheckmarkMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get className() {
		throw new Error("<CheckmarkMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set className(value) {
		throw new Error("<CheckmarkMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<CheckmarkMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<CheckmarkMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<CheckmarkMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<CheckmarkMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaLabel() {
		throw new Error("<CheckmarkMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaLabel(value) {
		throw new Error("<CheckmarkMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/@rubus/svelte-spectrum-icons-ui/src/ChevronDownMedium.svelte generated by Svelte v3.29.4 */
const file$2 = "node_modules/@rubus/svelte-spectrum-icons-ui/src/ChevronDownMedium.svelte";

// (51:26) 
function create_if_block_1$2(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M9.99 1.01A1 1 0 008.283.303L5 3.586 1.717.303A1 1 0 10.303 1.717l3.99 3.98a1 1 0 001.414 0l3.99-3.98a.997.997 0\n    00.293-.707z");
			add_location(path_1, file$2, 51, 4, 1216);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding_1*/ ctx[11](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding_1*/ ctx[11](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$2.name,
		type: "if",
		source: "(51:26) ",
		ctx
	});

	return block;
}

// (45:2) {#if scale === 'L'}
function create_if_block$2(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M11.99 1.51a1 1 0 00-1.707-.707L6 5.086 1.717.803A1 1 0 10.303 2.217l4.99 4.99a1 1 0 001.414 0l4.99-4.99a.997.997\n    0 00.293-.707z");
			add_location(path_1, file$2, 45, 4, 1012);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding*/ ctx[10](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding*/ ctx[10](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(45:2) {#if scale === 'L'}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let svg;
	let svg_width_value;
	let svg_height_value;
	let svg_class_value;

	function select_block_type(ctx, dirty) {
		if (/*scale*/ ctx[0] === "L") return create_if_block$2;
		if (/*scale*/ ctx[0] === "M") return create_if_block_1$2;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type && current_block_type(ctx);

	let svg_levels = [
		{ "aria-label": /*ariaLabel*/ ctx[4] },
		/*$$restProps*/ ctx[9],
		{
			width: svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]
		},
		{
			height: svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]
		},
		{ fill: "currentColor" },
		{
			class: svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]
		}
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	const block = {
		c: function create() {
			svg = svg_element("svg");
			if (if_block) if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					"aria-label": true,
					width: true,
					height: true,
					fill: true,
					class: true
				},
				1
			);

			var svg_nodes = children(svg);
			if (if_block) if_block.l(svg_nodes);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			set_svg_attributes(svg, svg_data);
			add_location(svg, file$2, 37, 0, 816);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			if (if_block) if_block.m(svg, null);
		},
		p: function update(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if (if_block) if_block.d(1);
				if_block = current_block_type && current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(svg, null);
				}
			}

			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				dirty & /*ariaLabel*/ 16 && { "aria-label": /*ariaLabel*/ ctx[4] },
				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9],
				dirty & /*width, sw*/ 68 && svg_width_value !== (svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]) && { width: svg_width_value },
				dirty & /*height, sh*/ 136 && svg_height_value !== (svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]) && { height: svg_height_value },
				{ fill: "currentColor" },
				dirty & /*className*/ 2 && svg_class_value !== (svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]) && { class: svg_class_value }
			]));
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);

			if (if_block) {
				if_block.d();
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	const omit_props_names = ["scale","className","width","height","ariaLabel"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("ChevronDownMedium", slots, []);
	let { scale = "M" } = $$props;
	let { className = "" } = $$props;
	let { width = "" } = $$props;
	let { height = "" } = $$props;
	let { ariaLabel = "ChevronDownMedium" } = $$props;
	let path;
	let sw;
	let sh;
	let flag = 14;

	onMount(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}
	});

	afterUpdate(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}

		if (!scale || scale == "M") {
			let rootClassName = document && document.documentElement.className;

			if (rootClassName && rootClassName.indexOf("spectrum--large") != -1) {
				$$invalidate(0, scale = "L");
			} else {
				$$invalidate(0, scale = "M");
			}
		}
	});

	function path_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	function path_1_binding_1($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("scale" in $$new_props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$new_props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$new_props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$new_props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$new_props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		onMount,
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag
	});

	$$self.$inject_state = $$new_props => {
		if ("scale" in $$props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
		if ("path" in $$props) $$invalidate(5, path = $$new_props.path);
		if ("sw" in $$props) $$invalidate(6, sw = $$new_props.sw);
		if ("sh" in $$props) $$invalidate(7, sh = $$new_props.sh);
		if ("flag" in $$props) $$invalidate(8, flag = $$new_props.flag);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag,
		$$restProps,
		path_1_binding,
		path_1_binding_1
	];
}

class ChevronDownMedium extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
			scale: 0,
			className: 1,
			width: 2,
			height: 3,
			ariaLabel: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ChevronDownMedium",
			options,
			id: create_fragment$2.name
		});
	}

	get scale() {
		throw new Error("<ChevronDownMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set scale(value) {
		throw new Error("<ChevronDownMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get className() {
		throw new Error("<ChevronDownMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set className(value) {
		throw new Error("<ChevronDownMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<ChevronDownMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<ChevronDownMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<ChevronDownMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<ChevronDownMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaLabel() {
		throw new Error("<ChevronDownMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaLabel(value) {
		throw new Error("<ChevronDownMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/@rubus/svelte-spectrum-icons-ui/src/ChevronRightMedium.svelte generated by Svelte v3.29.4 */
const file$3 = "node_modules/@rubus/svelte-spectrum-icons-ui/src/ChevronRightMedium.svelte";

// (51:26) 
function create_if_block_1$3(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M5.99 5a.997.997 0 00-.293-.707L1.717.303A1 1 0 10.303 1.717L3.586 5 .303 8.283a1 1 0 101.414\n    1.414l3.98-3.99A.997.997 0 005.99 5z");
			add_location(path_1, file$3, 51, 4, 1218);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding_1*/ ctx[11](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding_1*/ ctx[11](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$3.name,
		type: "if",
		source: "(51:26) ",
		ctx
	});

	return block;
}

// (45:2) {#if scale === 'L'}
function create_if_block$3(ctx) {
	let path_1;

	const block = {
		c: function create() {
			path_1 = svg_element("path");
			this.h();
		},
		l: function claim(nodes) {
			path_1 = claim_element(nodes, "path", { d: true }, 1);
			children(path_1).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(path_1, "d", "M7.5 6a.997.997 0 00-.293-.707L2.217.303A1 1 0 10.803 1.717L5.086 6 .803 10.283a1 1 0 101.414\n    1.414l4.99-4.99A.997.997 0 007.5 6z");
			add_location(path_1, file$3, 45, 4, 1013);
		},
		m: function mount(target, anchor) {
			insert_dev(target, path_1, anchor);
			/*path_1_binding*/ ctx[10](path_1);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(path_1);
			/*path_1_binding*/ ctx[10](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(45:2) {#if scale === 'L'}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let svg;
	let svg_width_value;
	let svg_height_value;
	let svg_class_value;

	function select_block_type(ctx, dirty) {
		if (/*scale*/ ctx[0] === "L") return create_if_block$3;
		if (/*scale*/ ctx[0] === "M") return create_if_block_1$3;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type && current_block_type(ctx);

	let svg_levels = [
		{ "aria-label": /*ariaLabel*/ ctx[4] },
		/*$$restProps*/ ctx[9],
		{
			width: svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]
		},
		{
			height: svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]
		},
		{ fill: "currentColor" },
		{
			class: svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]
		}
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	const block = {
		c: function create() {
			svg = svg_element("svg");
			if (if_block) if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			svg = claim_element(
				nodes,
				"svg",
				{
					"aria-label": true,
					width: true,
					height: true,
					fill: true,
					class: true
				},
				1
			);

			var svg_nodes = children(svg);
			if (if_block) if_block.l(svg_nodes);
			svg_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			set_svg_attributes(svg, svg_data);
			add_location(svg, file$3, 37, 0, 817);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			if (if_block) if_block.m(svg, null);
		},
		p: function update(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if (if_block) if_block.d(1);
				if_block = current_block_type && current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(svg, null);
				}
			}

			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				dirty & /*ariaLabel*/ 16 && { "aria-label": /*ariaLabel*/ ctx[4] },
				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9],
				dirty & /*width, sw*/ 68 && svg_width_value !== (svg_width_value = /*width*/ ctx[2] || /*sw*/ ctx[6] || /*flag*/ ctx[8]) && { width: svg_width_value },
				dirty & /*height, sh*/ 136 && svg_height_value !== (svg_height_value = /*height*/ ctx[3] || /*sh*/ ctx[7] || /*flag*/ ctx[8]) && { height: svg_height_value },
				{ fill: "currentColor" },
				dirty & /*className*/ 2 && svg_class_value !== (svg_class_value = "spectrum-Icon " + /*className*/ ctx[1]) && { class: svg_class_value }
			]));
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);

			if (if_block) {
				if_block.d();
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	const omit_props_names = ["scale","className","width","height","ariaLabel"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("ChevronRightMedium", slots, []);
	let { scale = "M" } = $$props;
	let { className = "" } = $$props;
	let { width = "" } = $$props;
	let { height = "" } = $$props;
	let { ariaLabel = "ChevronRightMedium" } = $$props;
	let path;
	let sw;
	let sh;
	let flag = 14;

	onMount(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}
	});

	afterUpdate(() => {
		if (path) {
			$$invalidate(6, sw = path.getBoundingClientRect().width);
			$$invalidate(7, sh = path.getBoundingClientRect().height);
		}

		if (!scale || scale == "M") {
			let rootClassName = document && document.documentElement.className;

			if (rootClassName && rootClassName.indexOf("spectrum--large") != -1) {
				$$invalidate(0, scale = "L");
			} else {
				$$invalidate(0, scale = "M");
			}
		}
	});

	function path_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	function path_1_binding_1($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			path = $$value;
			$$invalidate(5, path);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("scale" in $$new_props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$new_props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$new_props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$new_props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$new_props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		onMount,
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag
	});

	$$self.$inject_state = $$new_props => {
		if ("scale" in $$props) $$invalidate(0, scale = $$new_props.scale);
		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
		if ("width" in $$props) $$invalidate(2, width = $$new_props.width);
		if ("height" in $$props) $$invalidate(3, height = $$new_props.height);
		if ("ariaLabel" in $$props) $$invalidate(4, ariaLabel = $$new_props.ariaLabel);
		if ("path" in $$props) $$invalidate(5, path = $$new_props.path);
		if ("sw" in $$props) $$invalidate(6, sw = $$new_props.sw);
		if ("sh" in $$props) $$invalidate(7, sh = $$new_props.sh);
		if ("flag" in $$props) $$invalidate(8, flag = $$new_props.flag);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		scale,
		className,
		width,
		height,
		ariaLabel,
		path,
		sw,
		sh,
		flag,
		$$restProps,
		path_1_binding,
		path_1_binding_1
	];
}

class ChevronRightMedium extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			scale: 0,
			className: 1,
			width: 2,
			height: 3,
			ariaLabel: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ChevronRightMedium",
			options,
			id: create_fragment$3.name
		});
	}

	get scale() {
		throw new Error("<ChevronRightMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set scale(value) {
		throw new Error("<ChevronRightMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get className() {
		throw new Error("<ChevronRightMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set className(value) {
		throw new Error("<ChevronRightMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get width() {
		throw new Error("<ChevronRightMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set width(value) {
		throw new Error("<ChevronRightMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<ChevronRightMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<ChevronRightMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaLabel() {
		throw new Error("<ChevronRightMedium>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaLabel(value) {
		throw new Error("<ChevronRightMedium>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/**
 * A collection of shims that provide minimal functionality of the ES6 collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc */
var MapShim = (function () {
    if (typeof Map !== 'undefined') {
        return Map;
    }
    /**
     * Returns index in provided array that matches the specified key.
     *
     * @param {Array<Array>} arr
     * @param {*} key
     * @returns {number}
     */
    function getIndex(arr, key) {
        var result = -1;
        arr.some(function (entry, index) {
            if (entry[0] === key) {
                result = index;
                return true;
            }
            return false;
        });
        return result;
    }
    return /** @class */ (function () {
        function class_1() {
            this.__entries__ = [];
        }
        Object.defineProperty(class_1.prototype, "size", {
            /**
             * @returns {boolean}
             */
            get: function () {
                return this.__entries__.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param {*} key
         * @returns {*}
         */
        class_1.prototype.get = function (key) {
            var index = getIndex(this.__entries__, key);
            var entry = this.__entries__[index];
            return entry && entry[1];
        };
        /**
         * @param {*} key
         * @param {*} value
         * @returns {void}
         */
        class_1.prototype.set = function (key, value) {
            var index = getIndex(this.__entries__, key);
            if (~index) {
                this.__entries__[index][1] = value;
            }
            else {
                this.__entries__.push([key, value]);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.delete = function (key) {
            var entries = this.__entries__;
            var index = getIndex(entries, key);
            if (~index) {
                entries.splice(index, 1);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.has = function (key) {
            return !!~getIndex(this.__entries__, key);
        };
        /**
         * @returns {void}
         */
        class_1.prototype.clear = function () {
            this.__entries__.splice(0);
        };
        /**
         * @param {Function} callback
         * @param {*} [ctx=null]
         * @returns {void}
         */
        class_1.prototype.forEach = function (callback, ctx) {
            if (ctx === void 0) { ctx = null; }
            for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
                var entry = _a[_i];
                callback.call(ctx, entry[1], entry[0]);
            }
        };
        return class_1;
    }());
})();

/**
 * Detects whether window and document objects are available in current environment.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

// Returns global object of a current environment.
var global$1 = (function () {
    if (typeof global !== 'undefined' && global.Math === Math) {
        return global;
    }
    if (typeof self !== 'undefined' && self.Math === Math) {
        return self;
    }
    if (typeof window !== 'undefined' && window.Math === Math) {
        return window;
    }
    // eslint-disable-next-line no-new-func
    return Function('return this')();
})();

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
var requestAnimationFrame$1 = (function () {
    if (typeof requestAnimationFrame === 'function') {
        // It's required to use a bounded function because IE sometimes throws
        // an "Invalid calling object" error if rAF is invoked without the global
        // object on the left hand side.
        return requestAnimationFrame.bind(global$1);
    }
    return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
})();

// Defines minimum timeout before adding a trailing call.
var trailingTimeout = 2;
/**
 * Creates a wrapper function which ensures that provided callback will be
 * invoked only once during the specified delay period.
 *
 * @param {Function} callback - Function to be invoked after the delay period.
 * @param {number} delay - Delay after which to invoke callback.
 * @returns {Function}
 */
function throttle (callback, delay) {
    var leadingCall = false, trailingCall = false, lastCallTime = 0;
    /**
     * Invokes the original callback function and schedules new invocation if
     * the "proxy" was called during current request.
     *
     * @returns {void}
     */
    function resolvePending() {
        if (leadingCall) {
            leadingCall = false;
            callback();
        }
        if (trailingCall) {
            proxy();
        }
    }
    /**
     * Callback invoked after the specified delay. It will further postpone
     * invocation of the original function delegating it to the
     * requestAnimationFrame.
     *
     * @returns {void}
     */
    function timeoutCallback() {
        requestAnimationFrame$1(resolvePending);
    }
    /**
     * Schedules invocation of the original function.
     *
     * @returns {void}
     */
    function proxy() {
        var timeStamp = Date.now();
        if (leadingCall) {
            // Reject immediately following calls.
            if (timeStamp - lastCallTime < trailingTimeout) {
                return;
            }
            // Schedule new call to be in invoked when the pending one is resolved.
            // This is important for "transitions" which never actually start
            // immediately so there is a chance that we might miss one if change
            // happens amids the pending invocation.
            trailingCall = true;
        }
        else {
            leadingCall = true;
            trailingCall = false;
            setTimeout(timeoutCallback, delay);
        }
        lastCallTime = timeStamp;
    }
    return proxy;
}

// Minimum delay before invoking the update of observers.
var REFRESH_DELAY = 20;
// A list of substrings of CSS properties used to find transition events that
// might affect dimensions of observed elements.
var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
// Check if MutationObserver is available.
var mutationObserverSupported = typeof MutationObserver !== 'undefined';
/**
 * Singleton controller class which handles updates of ResizeObserver instances.
 */
var ResizeObserverController = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserverController.
     *
     * @private
     */
    function ResizeObserverController() {
        /**
         * Indicates whether DOM listeners have been added.
         *
         * @private {boolean}
         */
        this.connected_ = false;
        /**
         * Tells that controller has subscribed for Mutation Events.
         *
         * @private {boolean}
         */
        this.mutationEventsAdded_ = false;
        /**
         * Keeps reference to the instance of MutationObserver.
         *
         * @private {MutationObserver}
         */
        this.mutationsObserver_ = null;
        /**
         * A list of connected observers.
         *
         * @private {Array<ResizeObserverSPI>}
         */
        this.observers_ = [];
        this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
        this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
    }
    /**
     * Adds observer to observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be added.
     * @returns {void}
     */
    ResizeObserverController.prototype.addObserver = function (observer) {
        if (!~this.observers_.indexOf(observer)) {
            this.observers_.push(observer);
        }
        // Add listeners if they haven't been added yet.
        if (!this.connected_) {
            this.connect_();
        }
    };
    /**
     * Removes observer from observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be removed.
     * @returns {void}
     */
    ResizeObserverController.prototype.removeObserver = function (observer) {
        var observers = this.observers_;
        var index = observers.indexOf(observer);
        // Remove observer if it's present in registry.
        if (~index) {
            observers.splice(index, 1);
        }
        // Remove listeners if controller has no connected observers.
        if (!observers.length && this.connected_) {
            this.disconnect_();
        }
    };
    /**
     * Invokes the update of observers. It will continue running updates insofar
     * it detects changes.
     *
     * @returns {void}
     */
    ResizeObserverController.prototype.refresh = function () {
        var changesDetected = this.updateObservers_();
        // Continue running updates if changes have been detected as there might
        // be future ones caused by CSS transitions.
        if (changesDetected) {
            this.refresh();
        }
    };
    /**
     * Updates every observer from observers list and notifies them of queued
     * entries.
     *
     * @private
     * @returns {boolean} Returns "true" if any observer has detected changes in
     *      dimensions of it's elements.
     */
    ResizeObserverController.prototype.updateObservers_ = function () {
        // Collect observers that have active observations.
        var activeObservers = this.observers_.filter(function (observer) {
            return observer.gatherActive(), observer.hasActive();
        });
        // Deliver notifications in a separate cycle in order to avoid any
        // collisions between observers, e.g. when multiple instances of
        // ResizeObserver are tracking the same element and the callback of one
        // of them changes content dimensions of the observed target. Sometimes
        // this may result in notifications being blocked for the rest of observers.
        activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
        return activeObservers.length > 0;
    };
    /**
     * Initializes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.connect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already added.
        if (!isBrowser || this.connected_) {
            return;
        }
        // Subscription to the "Transitionend" event is used as a workaround for
        // delayed transitions. This way it's possible to capture at least the
        // final state of an element.
        document.addEventListener('transitionend', this.onTransitionEnd_);
        window.addEventListener('resize', this.refresh);
        if (mutationObserverSupported) {
            this.mutationsObserver_ = new MutationObserver(this.refresh);
            this.mutationsObserver_.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        else {
            document.addEventListener('DOMSubtreeModified', this.refresh);
            this.mutationEventsAdded_ = true;
        }
        this.connected_ = true;
    };
    /**
     * Removes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.disconnect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already removed.
        if (!isBrowser || !this.connected_) {
            return;
        }
        document.removeEventListener('transitionend', this.onTransitionEnd_);
        window.removeEventListener('resize', this.refresh);
        if (this.mutationsObserver_) {
            this.mutationsObserver_.disconnect();
        }
        if (this.mutationEventsAdded_) {
            document.removeEventListener('DOMSubtreeModified', this.refresh);
        }
        this.mutationsObserver_ = null;
        this.mutationEventsAdded_ = false;
        this.connected_ = false;
    };
    /**
     * "Transitionend" event handler.
     *
     * @private
     * @param {TransitionEvent} event
     * @returns {void}
     */
    ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
        var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
        // Detect whether transition may affect dimensions of an element.
        var isReflowProperty = transitionKeys.some(function (key) {
            return !!~propertyName.indexOf(key);
        });
        if (isReflowProperty) {
            this.refresh();
        }
    };
    /**
     * Returns instance of the ResizeObserverController.
     *
     * @returns {ResizeObserverController}
     */
    ResizeObserverController.getInstance = function () {
        if (!this.instance_) {
            this.instance_ = new ResizeObserverController();
        }
        return this.instance_;
    };
    /**
     * Holds reference to the controller's instance.
     *
     * @private {ResizeObserverController}
     */
    ResizeObserverController.instance_ = null;
    return ResizeObserverController;
}());

/**
 * Defines non-writable/enumerable properties of the provided target object.
 *
 * @param {Object} target - Object for which to define properties.
 * @param {Object} props - Properties to be defined.
 * @returns {Object} Target object.
 */
var defineConfigurable = (function (target, props) {
    for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
        var key = _a[_i];
        Object.defineProperty(target, key, {
            value: props[key],
            enumerable: false,
            writable: false,
            configurable: true
        });
    }
    return target;
});

/**
 * Returns the global object associated with provided element.
 *
 * @param {Object} target
 * @returns {Object}
 */
var getWindowOf = (function (target) {
    // Assume that the element is an instance of Node, which means that it
    // has the "ownerDocument" property from which we can retrieve a
    // corresponding global object.
    var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
    // Return the local global object if it's not possible extract one from
    // provided element.
    return ownerGlobal || global$1;
});

// Placeholder of an empty content rectangle.
var emptyRect = createRectInit(0, 0, 0, 0);
/**
 * Converts provided string to a number.
 *
 * @param {number|string} value
 * @returns {number}
 */
function toFloat(value) {
    return parseFloat(value) || 0;
}
/**
 * Extracts borders size from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @param {...string} positions - Borders positions (top, right, ...)
 * @returns {number}
 */
function getBordersSize(styles) {
    var positions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        positions[_i - 1] = arguments[_i];
    }
    return positions.reduce(function (size, position) {
        var value = styles['border-' + position + '-width'];
        return size + toFloat(value);
    }, 0);
}
/**
 * Extracts paddings sizes from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {Object} Paddings box.
 */
function getPaddings(styles) {
    var positions = ['top', 'right', 'bottom', 'left'];
    var paddings = {};
    for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
        var position = positions_1[_i];
        var value = styles['padding-' + position];
        paddings[position] = toFloat(value);
    }
    return paddings;
}
/**
 * Calculates content rectangle of provided SVG element.
 *
 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
 *      to be calculated.
 * @returns {DOMRectInit}
 */
function getSVGContentRect(target) {
    var bbox = target.getBBox();
    return createRectInit(0, 0, bbox.width, bbox.height);
}
/**
 * Calculates content rectangle of provided HTMLElement.
 *
 * @param {HTMLElement} target - Element for which to calculate the content rectangle.
 * @returns {DOMRectInit}
 */
function getHTMLElementContentRect(target) {
    // Client width & height properties can't be
    // used exclusively as they provide rounded values.
    var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
    // By this condition we can catch all non-replaced inline, hidden and
    // detached elements. Though elements with width & height properties less
    // than 0.5 will be discarded as well.
    //
    // Without it we would need to implement separate methods for each of
    // those cases and it's not possible to perform a precise and performance
    // effective test for hidden elements. E.g. even jQuery's ':visible' filter
    // gives wrong results for elements with width & height less than 0.5.
    if (!clientWidth && !clientHeight) {
        return emptyRect;
    }
    var styles = getWindowOf(target).getComputedStyle(target);
    var paddings = getPaddings(styles);
    var horizPad = paddings.left + paddings.right;
    var vertPad = paddings.top + paddings.bottom;
    // Computed styles of width & height are being used because they are the
    // only dimensions available to JS that contain non-rounded values. It could
    // be possible to utilize the getBoundingClientRect if only it's data wasn't
    // affected by CSS transformations let alone paddings, borders and scroll bars.
    var width = toFloat(styles.width), height = toFloat(styles.height);
    // Width & height include paddings and borders when the 'border-box' box
    // model is applied (except for IE).
    if (styles.boxSizing === 'border-box') {
        // Following conditions are required to handle Internet Explorer which
        // doesn't include paddings and borders to computed CSS dimensions.
        //
        // We can say that if CSS dimensions + paddings are equal to the "client"
        // properties then it's either IE, and thus we don't need to subtract
        // anything, or an element merely doesn't have paddings/borders styles.
        if (Math.round(width + horizPad) !== clientWidth) {
            width -= getBordersSize(styles, 'left', 'right') + horizPad;
        }
        if (Math.round(height + vertPad) !== clientHeight) {
            height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
        }
    }
    // Following steps can't be applied to the document's root element as its
    // client[Width/Height] properties represent viewport area of the window.
    // Besides, it's as well not necessary as the <html> itself neither has
    // rendered scroll bars nor it can be clipped.
    if (!isDocumentElement(target)) {
        // In some browsers (only in Firefox, actually) CSS width & height
        // include scroll bars size which can be removed at this step as scroll
        // bars are the only difference between rounded dimensions + paddings
        // and "client" properties, though that is not always true in Chrome.
        var vertScrollbar = Math.round(width + horizPad) - clientWidth;
        var horizScrollbar = Math.round(height + vertPad) - clientHeight;
        // Chrome has a rather weird rounding of "client" properties.
        // E.g. for an element with content width of 314.2px it sometimes gives
        // the client width of 315px and for the width of 314.7px it may give
        // 314px. And it doesn't happen all the time. So just ignore this delta
        // as a non-relevant.
        if (Math.abs(vertScrollbar) !== 1) {
            width -= vertScrollbar;
        }
        if (Math.abs(horizScrollbar) !== 1) {
            height -= horizScrollbar;
        }
    }
    return createRectInit(paddings.left, paddings.top, width, height);
}
/**
 * Checks whether provided element is an instance of the SVGGraphicsElement.
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
var isSVGGraphicsElement = (function () {
    // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
    // interface.
    if (typeof SVGGraphicsElement !== 'undefined') {
        return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
    }
    // If it's so, then check that element is at least an instance of the
    // SVGElement and that it has the "getBBox" method.
    // eslint-disable-next-line no-extra-parens
    return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
        typeof target.getBBox === 'function'); };
})();
/**
 * Checks whether provided element is a document element (<html>).
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
function isDocumentElement(target) {
    return target === getWindowOf(target).document.documentElement;
}
/**
 * Calculates an appropriate content rectangle for provided html or svg element.
 *
 * @param {Element} target - Element content rectangle of which needs to be calculated.
 * @returns {DOMRectInit}
 */
function getContentRect(target) {
    if (!isBrowser) {
        return emptyRect;
    }
    if (isSVGGraphicsElement(target)) {
        return getSVGContentRect(target);
    }
    return getHTMLElementContentRect(target);
}
/**
 * Creates rectangle with an interface of the DOMRectReadOnly.
 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
 *
 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
 * @returns {DOMRectReadOnly}
 */
function createReadOnlyRect(_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    // If DOMRectReadOnly is available use it as a prototype for the rectangle.
    var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
    var rect = Object.create(Constr.prototype);
    // Rectangle's properties are not writable and non-enumerable.
    defineConfigurable(rect, {
        x: x, y: y, width: width, height: height,
        top: y,
        right: x + width,
        bottom: height + y,
        left: x
    });
    return rect;
}
/**
 * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
 * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
 *
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} width - Rectangle's width.
 * @param {number} height - Rectangle's height.
 * @returns {DOMRectInit}
 */
function createRectInit(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}

/**
 * Class that is responsible for computations of the content rectangle of
 * provided DOM element and for keeping track of it's changes.
 */
var ResizeObservation = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObservation.
     *
     * @param {Element} target - Element to be observed.
     */
    function ResizeObservation(target) {
        /**
         * Broadcasted width of content rectangle.
         *
         * @type {number}
         */
        this.broadcastWidth = 0;
        /**
         * Broadcasted height of content rectangle.
         *
         * @type {number}
         */
        this.broadcastHeight = 0;
        /**
         * Reference to the last observed content rectangle.
         *
         * @private {DOMRectInit}
         */
        this.contentRect_ = createRectInit(0, 0, 0, 0);
        this.target = target;
    }
    /**
     * Updates content rectangle and tells whether it's width or height properties
     * have changed since the last broadcast.
     *
     * @returns {boolean}
     */
    ResizeObservation.prototype.isActive = function () {
        var rect = getContentRect(this.target);
        this.contentRect_ = rect;
        return (rect.width !== this.broadcastWidth ||
            rect.height !== this.broadcastHeight);
    };
    /**
     * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
     * from the corresponding properties of the last observed content rectangle.
     *
     * @returns {DOMRectInit} Last observed content rectangle.
     */
    ResizeObservation.prototype.broadcastRect = function () {
        var rect = this.contentRect_;
        this.broadcastWidth = rect.width;
        this.broadcastHeight = rect.height;
        return rect;
    };
    return ResizeObservation;
}());

var ResizeObserverEntry = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObserverEntry.
     *
     * @param {Element} target - Element that is being observed.
     * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
     */
    function ResizeObserverEntry(target, rectInit) {
        var contentRect = createReadOnlyRect(rectInit);
        // According to the specification following properties are not writable
        // and are also not enumerable in the native implementation.
        //
        // Property accessors are not being used as they'd require to define a
        // private WeakMap storage which may cause memory leaks in browsers that
        // don't support this type of collections.
        defineConfigurable(this, { target: target, contentRect: contentRect });
    }
    return ResizeObserverEntry;
}());

var ResizeObserverSPI = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback function that is invoked
     *      when one of the observed elements changes it's content dimensions.
     * @param {ResizeObserverController} controller - Controller instance which
     *      is responsible for the updates of observer.
     * @param {ResizeObserver} callbackCtx - Reference to the public
     *      ResizeObserver instance which will be passed to callback function.
     */
    function ResizeObserverSPI(callback, controller, callbackCtx) {
        /**
         * Collection of resize observations that have detected changes in dimensions
         * of elements.
         *
         * @private {Array<ResizeObservation>}
         */
        this.activeObservations_ = [];
        /**
         * Registry of the ResizeObservation instances.
         *
         * @private {Map<Element, ResizeObservation>}
         */
        this.observations_ = new MapShim();
        if (typeof callback !== 'function') {
            throw new TypeError('The callback provided as parameter 1 is not a function.');
        }
        this.callback_ = callback;
        this.controller_ = controller;
        this.callbackCtx_ = callbackCtx;
    }
    /**
     * Starts observing provided element.
     *
     * @param {Element} target - Element to be observed.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.observe = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is already being observed.
        if (observations.has(target)) {
            return;
        }
        observations.set(target, new ResizeObservation(target));
        this.controller_.addObserver(this);
        // Force the update of observations.
        this.controller_.refresh();
    };
    /**
     * Stops observing provided element.
     *
     * @param {Element} target - Element to stop observing.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.unobserve = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is not being observed.
        if (!observations.has(target)) {
            return;
        }
        observations.delete(target);
        if (!observations.size) {
            this.controller_.removeObserver(this);
        }
    };
    /**
     * Stops observing all elements.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.disconnect = function () {
        this.clearActive();
        this.observations_.clear();
        this.controller_.removeObserver(this);
    };
    /**
     * Collects observation instances the associated element of which has changed
     * it's content rectangle.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.gatherActive = function () {
        var _this = this;
        this.clearActive();
        this.observations_.forEach(function (observation) {
            if (observation.isActive()) {
                _this.activeObservations_.push(observation);
            }
        });
    };
    /**
     * Invokes initial callback function with a list of ResizeObserverEntry
     * instances collected from active resize observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.broadcastActive = function () {
        // Do nothing if observer doesn't have active observations.
        if (!this.hasActive()) {
            return;
        }
        var ctx = this.callbackCtx_;
        // Create ResizeObserverEntry instance for every active observation.
        var entries = this.activeObservations_.map(function (observation) {
            return new ResizeObserverEntry(observation.target, observation.broadcastRect());
        });
        this.callback_.call(ctx, entries, ctx);
        this.clearActive();
    };
    /**
     * Clears the collection of active observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.clearActive = function () {
        this.activeObservations_.splice(0);
    };
    /**
     * Tells whether observer has active observations.
     *
     * @returns {boolean}
     */
    ResizeObserverSPI.prototype.hasActive = function () {
        return this.activeObservations_.length > 0;
    };
    return ResizeObserverSPI;
}());

// Registry of internal observers. If WeakMap is not available use current shim
// for the Map collection as it has all required methods and because WeakMap
// can't be fully polyfilled anyway.
var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
/**
 * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
 * exposing only those methods and properties that are defined in the spec.
 */
var ResizeObserver = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback that is invoked when
     *      dimensions of the observed elements change.
     */
    function ResizeObserver(callback) {
        if (!(this instanceof ResizeObserver)) {
            throw new TypeError('Cannot call a class as a function.');
        }
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        var controller = ResizeObserverController.getInstance();
        var observer = new ResizeObserverSPI(callback, controller, this);
        observers.set(this, observer);
    }
    return ResizeObserver;
}());
// Expose public methods of ResizeObserver.
[
    'observe',
    'unobserve',
    'disconnect'
].forEach(function (method) {
    ResizeObserver.prototype[method] = function () {
        var _a;
        return (_a = observers.get(this))[method].apply(_a, arguments);
    };
});

var index = (function () {
    // Export existing implementation if available.
    if (typeof global$1.ResizeObserver !== 'undefined') {
        return global$1.ResizeObserver;
    }
    return ResizeObserver;
})();

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

function getEventsAction(component) {
  return (node) => {
    const events = Object.keys(component.$$.callbacks);
    const listeners = [];

    events.forEach((event) => listeners.push(listen(node, event, (e) => bubble(component, e))));

    return {
      destroy: () => {
        listeners.forEach((listener) => listener());
      },
    };
  };
}

/* node_modules/@rubus/rubus/src/packages/ActionGroup/ActionGroup.svelte generated by Svelte v3.29.4 */
const file$4 = "node_modules/@rubus/rubus/src/packages/ActionGroup/ActionGroup.svelte";

function create_fragment$4(ctx) {
	let div;
	let current;
	const default_slot_template = /*#slots*/ ctx[11].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

	const block = {
		c: function create() {
			div = element("div");
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true, style: true });
			var div_nodes = children(div);
			if (default_slot) default_slot.l(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div, "class", "spectrum-ActionGroup");
			attr_dev(div, "style", /*styleCssText*/ ctx[5]);
			toggle_class(div, "spectrum-ActionGroup--justified", /*variants*/ ctx[1] === "justified");
			toggle_class(div, "spectrum-ActionGroup--vertical", /*orientation*/ ctx[0] === "vertical");
			toggle_class(div, "spectrum-ActionGroup--quiet", /*isQuiet*/ ctx[2]);
			toggle_class(div, "spectrum-ActionGroup--compact", /*isCompact*/ ctx[3]);
			add_location(div, file$4, 97, 0, 2664);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			/*div_binding*/ ctx[12](div);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 1024) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
				}
			}

			if (!current || dirty & /*styleCssText*/ 32) {
				attr_dev(div, "style", /*styleCssText*/ ctx[5]);
			}

			if (dirty & /*variants*/ 2) {
				toggle_class(div, "spectrum-ActionGroup--justified", /*variants*/ ctx[1] === "justified");
			}

			if (dirty & /*orientation*/ 1) {
				toggle_class(div, "spectrum-ActionGroup--vertical", /*orientation*/ ctx[0] === "vertical");
			}

			if (dirty & /*isQuiet*/ 4) {
				toggle_class(div, "spectrum-ActionGroup--quiet", /*isQuiet*/ ctx[2]);
			}

			if (dirty & /*isCompact*/ 8) {
				toggle_class(div, "spectrum-ActionGroup--compact", /*isCompact*/ ctx[3]);
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
			if (detaching) detach_dev(div);
			if (default_slot) default_slot.d(detaching);
			/*div_binding*/ ctx[12](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("ActionGroup", slots, ['default']);
	let { orientation = "horizontal" } = $$props;
	let { variants = "general" } = $$props;
	let { dimension = "" } = $$props;
	let { onlyIcon = false } = $$props;
	let { isQuiet = false } = $$props;
	let { isCompact = false } = $$props;
	let { emphasized = false } = $$props;
	let { disabled = false } = $$props;
	let actionGroup;

	function addChildClassName() {
		let buttonClassName = [
			" spectrum-ActionGroup-item",
			isQuiet && "spectrum-ActionButton--quiet",
			emphasized && "spectrum-ActionButton--emphasized"
		].filter(Boolean).join(" ");

		if (actionGroup) {
			const buttonItem = actionGroup.getElementsByClassName("spectrum-ActionButton");

			if (buttonItem.length !== 0) {
				for (let index = 0; index < buttonItem.length; index++) {
					if (disabled) {
						buttonItem[index].setAttribute("disabled", disabled);
					}

					buttonItem[index].className = buttonItem[index].className + buttonClassName;
				}
			}

			if (onlyIcon && variants === "general") {
				const buttonWrapItem = actionGroup.getElementsByClassName("spectrum-Button-wrap");

				if (buttonWrapItem.length !== 0) {
					for (let index = 0; index < buttonWrapItem.length; index++) {
						buttonWrapItem[index].className = buttonWrapItem[index].className + " rubus-button-wrap";
					}
				}
			}
		}
	}

	afterUpdate(() => {
		addChildClassName();
	});

	const writable_props = [
		"orientation",
		"variants",
		"dimension",
		"onlyIcon",
		"isQuiet",
		"isCompact",
		"emphasized",
		"disabled"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ActionGroup> was created with unknown prop '${key}'`);
	});

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			actionGroup = $$value;
			$$invalidate(4, actionGroup);
		});
	}

	$$self.$$set = $$props => {
		if ("orientation" in $$props) $$invalidate(0, orientation = $$props.orientation);
		if ("variants" in $$props) $$invalidate(1, variants = $$props.variants);
		if ("dimension" in $$props) $$invalidate(6, dimension = $$props.dimension);
		if ("onlyIcon" in $$props) $$invalidate(7, onlyIcon = $$props.onlyIcon);
		if ("isQuiet" in $$props) $$invalidate(2, isQuiet = $$props.isQuiet);
		if ("isCompact" in $$props) $$invalidate(3, isCompact = $$props.isCompact);
		if ("emphasized" in $$props) $$invalidate(8, emphasized = $$props.emphasized);
		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		orientation,
		variants,
		dimension,
		onlyIcon,
		isQuiet,
		isCompact,
		emphasized,
		disabled,
		actionGroup,
		addChildClassName,
		styleCssText
	});

	$$self.$inject_state = $$props => {
		if ("orientation" in $$props) $$invalidate(0, orientation = $$props.orientation);
		if ("variants" in $$props) $$invalidate(1, variants = $$props.variants);
		if ("dimension" in $$props) $$invalidate(6, dimension = $$props.dimension);
		if ("onlyIcon" in $$props) $$invalidate(7, onlyIcon = $$props.onlyIcon);
		if ("isQuiet" in $$props) $$invalidate(2, isQuiet = $$props.isQuiet);
		if ("isCompact" in $$props) $$invalidate(3, isCompact = $$props.isCompact);
		if ("emphasized" in $$props) $$invalidate(8, emphasized = $$props.emphasized);
		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
		if ("actionGroup" in $$props) $$invalidate(4, actionGroup = $$props.actionGroup);
		if ("styleCssText" in $$props) $$invalidate(5, styleCssText = $$props.styleCssText);
	};

	let styleCssText;

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*variants, orientation, dimension*/ 67) {
			 $$invalidate(5, styleCssText = [
				variants === "justified" && orientation === "horizontal" && `width:var(--spectrum-global-dimension-${dimension}, var(--spectrum-alias-${dimension}))`,
				variants === "justified" && orientation === "vertical" && `height:var(--spectrum-global-dimension-${dimension}, var(--spectrum-alias-${dimension}))`
			].filter(Boolean).join(" "));
		}
	};

	return [
		orientation,
		variants,
		isQuiet,
		isCompact,
		actionGroup,
		styleCssText,
		dimension,
		onlyIcon,
		emphasized,
		disabled,
		$$scope,
		slots,
		div_binding
	];
}

class ActionGroup extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
			orientation: 0,
			variants: 1,
			dimension: 6,
			onlyIcon: 7,
			isQuiet: 2,
			isCompact: 3,
			emphasized: 8,
			disabled: 9
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ActionGroup",
			options,
			id: create_fragment$4.name
		});
	}

	get orientation() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set orientation(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get variants() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set variants(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get dimension() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set dimension(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get onlyIcon() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set onlyIcon(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isQuiet() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isQuiet(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isCompact() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isCompact(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get emphasized() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set emphasized(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get disabled() {
		throw new Error("<ActionGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<ActionGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/@rubus/rubus/src/packages/Button/Button.svelte generated by Svelte v3.29.4 */
const file$5 = "node_modules/@rubus/rubus/src/packages/Button/Button.svelte";
const get_button_icon_slot_changes_1 = dirty => ({});
const get_button_icon_slot_context_1 = ctx => ({});
const get_button_icon_slot_changes = dirty => ({});
const get_button_icon_slot_context = ctx => ({});

// (138:0) {:else}
function create_else_block_1(ctx) {
	let button;
	let current_block_type_index;
	let if_block;
	let eventsListen_action;
	let current;
	let mounted;
	let dispose;
	const if_block_creators = [create_if_block_2, create_else_block_2];
	const if_blocks = [];

	function select_block_type_2(ctx, dirty) {
		if (/*exterior*/ ctx[3] == "clear" || /*exterior*/ ctx[3] == "logic-or" || /*exterior*/ ctx[3] == "logic-and") return 0;
		return 1;
	}

	current_block_type_index = select_block_type_2(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	let button_levels = [/*buttonProps*/ ctx[4], { "aria-label": /*ariaLabel*/ ctx[0] }];
	let button_data = {};

	for (let i = 0; i < button_levels.length; i += 1) {
		button_data = assign(button_data, button_levels[i]);
	}

	const block = {
		c: function create() {
			button = element("button");
			if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			button = claim_element(nodes, "BUTTON", { "aria-label": true });
			var button_nodes = children(button);
			if_block.l(button_nodes);
			button_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			set_attributes(button, button_data);
			toggle_class(button, "svelte-e38yby", true);
			add_location(button, file$5, 138, 2, 3700);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			if_blocks[current_block_type_index].m(button, null);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(eventsListen_action = /*eventsListen*/ ctx[5].call(null, button));
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_2(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(button, null);
			}

			set_attributes(button, button_data = get_spread_update(button_levels, [
				dirty & /*buttonProps*/ 16 && /*buttonProps*/ ctx[4],
				(!current || dirty & /*ariaLabel*/ 1) && { "aria-label": /*ariaLabel*/ ctx[0] }
			]));

			toggle_class(button, "svelte-e38yby", true);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			if_blocks[current_block_type_index].d();
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block_1.name,
		type: "else",
		source: "(138:0) {:else}",
		ctx
	});

	return block;
}

// (127:0) {#if href}
function create_if_block$4(ctx) {
	let a;
	let current_block_type_index;
	let if_block;
	let eventsListen_action;
	let current;
	let mounted;
	let dispose;
	const if_block_creators = [create_if_block_1$4, create_else_block];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*exterior*/ ctx[3] == "clear" || /*exterior*/ ctx[3] == "logic-or" || /*exterior*/ ctx[3] == "logic-and") return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	let a_levels = [
		/*buttonProps*/ ctx[4],
		{ "aria-label": /*ariaLabel*/ ctx[0] },
		{ href: /*href*/ ctx[1] },
		{ target: /*target*/ ctx[2] }
	];

	let a_data = {};

	for (let i = 0; i < a_levels.length; i += 1) {
		a_data = assign(a_data, a_levels[i]);
	}

	const block = {
		c: function create() {
			a = element("a");
			if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			a = claim_element(nodes, "A", {
				"aria-label": true,
				href: true,
				target: true
			});

			var a_nodes = children(a);
			if_block.l(a_nodes);
			a_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			set_attributes(a, a_data);
			toggle_class(a, "svelte-e38yby", true);
			add_location(a, file$5, 127, 2, 3334);
		},
		m: function mount(target, anchor) {
			insert_dev(target, a, anchor);
			if_blocks[current_block_type_index].m(a, null);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(eventsListen_action = /*eventsListen*/ ctx[5].call(null, a));
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(a, null);
			}

			set_attributes(a, a_data = get_spread_update(a_levels, [
				dirty & /*buttonProps*/ 16 && /*buttonProps*/ ctx[4],
				(!current || dirty & /*ariaLabel*/ 1) && { "aria-label": /*ariaLabel*/ ctx[0] },
				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
				(!current || dirty & /*target*/ 4) && { target: /*target*/ ctx[2] }
			]));

			toggle_class(a, "svelte-e38yby", true);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
			if_blocks[current_block_type_index].d();
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(127:0) {#if href}",
		ctx
	});

	return block;
}

// (142:4) {:else}
function create_else_block_2(ctx) {
	let t;
	let span;
	let span_class_value;
	let current;
	const button_icon_slot_template = /*#slots*/ ctx[17]["button-icon"];
	const button_icon_slot = create_slot(button_icon_slot_template, ctx, /*$$scope*/ ctx[16], get_button_icon_slot_context_1);
	const default_slot_template = /*#slots*/ ctx[17].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

	const block = {
		c: function create() {
			if (button_icon_slot) button_icon_slot.c();
			t = space();
			span = element("span");
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			if (button_icon_slot) button_icon_slot.l(nodes);
			t = claim_space(nodes);
			span = claim_element(nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			if (default_slot) default_slot.l(span_nodes);
			span_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", span_class_value = "spectrum-" + (/*exterior*/ ctx[3] == "action"
			? "ActionButton"
			: "Button") + "-label");

			add_location(span, file$5, 143, 6, 3916);
		},
		m: function mount(target, anchor) {
			if (button_icon_slot) {
				button_icon_slot.m(target, anchor);
			}

			insert_dev(target, t, anchor);
			insert_dev(target, span, anchor);

			if (default_slot) {
				default_slot.m(span, null);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (button_icon_slot) {
				if (button_icon_slot.p && dirty & /*$$scope*/ 65536) {
					update_slot(button_icon_slot, button_icon_slot_template, ctx, /*$$scope*/ ctx[16], dirty, get_button_icon_slot_changes_1, get_button_icon_slot_context_1);
				}
			}

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 65536) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[16], dirty, null, null);
				}
			}

			if (!current || dirty & /*exterior*/ 8 && span_class_value !== (span_class_value = "spectrum-" + (/*exterior*/ ctx[3] == "action"
			? "ActionButton"
			: "Button") + "-label")) {
				attr_dev(span, "class", span_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button_icon_slot, local);
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button_icon_slot, local);
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (button_icon_slot) button_icon_slot.d(detaching);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(span);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block_2.name,
		type: "else",
		source: "(142:4) {:else}",
		ctx
	});

	return block;
}

// (140:4) {#if exterior == 'clear' || exterior == 'logic-or' || exterior == 'logic-and'}
function create_if_block_2(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[17].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			if (default_slot) default_slot.l(nodes);
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 65536) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[16], dirty, null, null);
				}
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
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(140:4) {#if exterior == 'clear' || exterior == 'logic-or' || exterior == 'logic-and'}",
		ctx
	});

	return block;
}

// (131:4) {:else}
function create_else_block(ctx) {
	let t;
	let span;
	let span_class_value;
	let current;
	const button_icon_slot_template = /*#slots*/ ctx[17]["button-icon"];
	const button_icon_slot = create_slot(button_icon_slot_template, ctx, /*$$scope*/ ctx[16], get_button_icon_slot_context);
	const default_slot_template = /*#slots*/ ctx[17].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

	const block = {
		c: function create() {
			if (button_icon_slot) button_icon_slot.c();
			t = space();
			span = element("span");
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			if (button_icon_slot) button_icon_slot.l(nodes);
			t = claim_space(nodes);
			span = claim_element(nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			if (default_slot) default_slot.l(span_nodes);
			span_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", span_class_value = "spectrum-" + (/*exterior*/ ctx[3] == "action"
			? "ActionButton"
			: "Button") + "-label");

			add_location(span, file$5, 132, 6, 3561);
		},
		m: function mount(target, anchor) {
			if (button_icon_slot) {
				button_icon_slot.m(target, anchor);
			}

			insert_dev(target, t, anchor);
			insert_dev(target, span, anchor);

			if (default_slot) {
				default_slot.m(span, null);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (button_icon_slot) {
				if (button_icon_slot.p && dirty & /*$$scope*/ 65536) {
					update_slot(button_icon_slot, button_icon_slot_template, ctx, /*$$scope*/ ctx[16], dirty, get_button_icon_slot_changes, get_button_icon_slot_context);
				}
			}

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 65536) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[16], dirty, null, null);
				}
			}

			if (!current || dirty & /*exterior*/ 8 && span_class_value !== (span_class_value = "spectrum-" + (/*exterior*/ ctx[3] == "action"
			? "ActionButton"
			: "Button") + "-label")) {
				attr_dev(span, "class", span_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button_icon_slot, local);
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button_icon_slot, local);
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (button_icon_slot) button_icon_slot.d(detaching);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(span);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(131:4) {:else}",
		ctx
	});

	return block;
}

// (129:4) {#if exterior == 'clear' || exterior == 'logic-or' || exterior == 'logic-and'}
function create_if_block_1$4(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[17].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			if (default_slot) default_slot.l(nodes);
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 65536) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[16], dirty, null, null);
				}
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
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$4.name,
		type: "if",
		source: "(129:4) {#if exterior == 'clear' || exterior == 'logic-or' || exterior == 'logic-and'}",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$4, create_else_block_1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*href*/ ctx[1]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			if_block.l(nodes);
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props, $$invalidate) {
	const omit_props_names = [
		"tabindex","disabled","id","ariaLabel","href","target","type","exterior","variant","isQuiet","isSelected","isSmall","emphasized","notAllowed"
	];

	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Button", slots, ['default','button-icon']);
	let { tabindex = 0 } = $$props;
	let { disabled = false } = $$props;
	let { id = "" } = $$props;
	let { ariaLabel = "button" } = $$props;
	let { href = "" } = $$props;
	let { target = "" } = $$props;
	let { type = "button" } = $$props;
	let { exterior = "general" } = $$props;
	let { variant = "cta" } = $$props;
	let { isQuiet = false } = $$props;
	let { isSelected = false } = $$props;
	let { isSmall = false } = $$props;
	let { emphasized = false } = $$props;
	let { notAllowed = false } = $$props;
	const eventsListen = getEventsAction(current_component);

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(18, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("tabindex" in $$new_props) $$invalidate(6, tabindex = $$new_props.tabindex);
		if ("disabled" in $$new_props) $$invalidate(7, disabled = $$new_props.disabled);
		if ("id" in $$new_props) $$invalidate(8, id = $$new_props.id);
		if ("ariaLabel" in $$new_props) $$invalidate(0, ariaLabel = $$new_props.ariaLabel);
		if ("href" in $$new_props) $$invalidate(1, href = $$new_props.href);
		if ("target" in $$new_props) $$invalidate(2, target = $$new_props.target);
		if ("type" in $$new_props) $$invalidate(9, type = $$new_props.type);
		if ("exterior" in $$new_props) $$invalidate(3, exterior = $$new_props.exterior);
		if ("variant" in $$new_props) $$invalidate(10, variant = $$new_props.variant);
		if ("isQuiet" in $$new_props) $$invalidate(11, isQuiet = $$new_props.isQuiet);
		if ("isSelected" in $$new_props) $$invalidate(12, isSelected = $$new_props.isSelected);
		if ("isSmall" in $$new_props) $$invalidate(13, isSmall = $$new_props.isSmall);
		if ("emphasized" in $$new_props) $$invalidate(14, emphasized = $$new_props.emphasized);
		if ("notAllowed" in $$new_props) $$invalidate(15, notAllowed = $$new_props.notAllowed);
		if ("$$scope" in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		current_component,
		getEventsAction,
		tabindex,
		disabled,
		id,
		ariaLabel,
		href,
		target,
		type,
		exterior,
		variant,
		isQuiet,
		isSelected,
		isSmall,
		emphasized,
		notAllowed,
		eventsListen,
		buttonProps
	});

	$$self.$inject_state = $$new_props => {
		if ("tabindex" in $$props) $$invalidate(6, tabindex = $$new_props.tabindex);
		if ("disabled" in $$props) $$invalidate(7, disabled = $$new_props.disabled);
		if ("id" in $$props) $$invalidate(8, id = $$new_props.id);
		if ("ariaLabel" in $$props) $$invalidate(0, ariaLabel = $$new_props.ariaLabel);
		if ("href" in $$props) $$invalidate(1, href = $$new_props.href);
		if ("target" in $$props) $$invalidate(2, target = $$new_props.target);
		if ("type" in $$props) $$invalidate(9, type = $$new_props.type);
		if ("exterior" in $$props) $$invalidate(3, exterior = $$new_props.exterior);
		if ("variant" in $$props) $$invalidate(10, variant = $$new_props.variant);
		if ("isQuiet" in $$props) $$invalidate(11, isQuiet = $$new_props.isQuiet);
		if ("isSelected" in $$props) $$invalidate(12, isSelected = $$new_props.isSelected);
		if ("isSmall" in $$props) $$invalidate(13, isSmall = $$new_props.isSmall);
		if ("emphasized" in $$props) $$invalidate(14, emphasized = $$new_props.emphasized);
		if ("notAllowed" in $$props) $$invalidate(15, notAllowed = $$new_props.notAllowed);
		if ("buttonProps" in $$props) $$invalidate(4, buttonProps = $$new_props.buttonProps);
	};

	let buttonProps;

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		 $$invalidate(4, buttonProps = {
			id,
			type,
			role: "button",
			tabindex,
			disabled,
			...$$restProps,
			class: [
				exterior === "general" && "spectrum-Button",
				exterior === "general" && `spectrum-Button--${variant}`,
				exterior === "general" && isQuiet && `spectrum-Button--quiet`,
				exterior === "clear" && "spectrum-ClearButton",
				exterior === "clear" && `spectrum-ClearButton--${variant}`,
				exterior === "clear" && (isSmall
				? "spectrum-ClearButton--small"
				: "spectrum-ClearButton--medium"),
				exterior === "logic-or" && "spectrum-LogicButton spectrum-LogicButton--or",
				exterior === "logic-and" && "spectrum-LogicButton spectrum-LogicButton--and",
				exterior === "action" && "spectrum-ActionButton",
				exterior === "action" && isQuiet && `spectrum-ActionButton--quiet`,
				exterior === "action" && emphasized && "spectrum-ActionButton--emphasized",
				isSelected && "is-selected",
				disabled && notAllowed && "not-allowed",
				`${$$restProps.class}`
			].filter(Boolean).join(" ")
		});
	};

	return [
		ariaLabel,
		href,
		target,
		exterior,
		buttonProps,
		eventsListen,
		tabindex,
		disabled,
		id,
		type,
		variant,
		isQuiet,
		isSelected,
		isSmall,
		emphasized,
		notAllowed,
		$$scope,
		slots
	];
}

class Button extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
			tabindex: 6,
			disabled: 7,
			id: 8,
			ariaLabel: 0,
			href: 1,
			target: 2,
			type: 9,
			exterior: 3,
			variant: 10,
			isQuiet: 11,
			isSelected: 12,
			isSmall: 13,
			emphasized: 14,
			notAllowed: 15
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Button",
			options,
			id: create_fragment$5.name
		});
	}

	get tabindex() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set tabindex(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get disabled() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get id() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaLabel() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaLabel(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get href() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set href(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get target() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set target(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get type() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set type(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get exterior() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set exterior(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get variant() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set variant(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isQuiet() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isQuiet(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isSelected() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isSelected(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isSmall() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isSmall(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get emphasized() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set emphasized(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get notAllowed() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set notAllowed(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function getRect(element) {
  var rect = element.getBoundingClientRect();
  var top = window.innerHeight || document.documentElement.clientTop;
  var left = window.innerWidth || document.documentElement.clientLeft;

  return {
    top: rect.top - top,
    bottom: Math.abs(rect.bottom - top),
    left: rect.left - left,
    right: Math.abs(rect.right - left),
    x: rect.x,
    y: rect.y,
    width: rect.width || element.offsetWidth,
    height: rect.height || element.offsetHeight,
  };
}

function getInTheBoxPosition(prevNode, targetNode) {
  let posWidth = 0;
  let posHeight = 0;
  let childNodesList = prevNode.childNodes;
  let targetIndex = Array.prototype.indexOf.call(targetNode.parentNode.childNodes, targetNode);

  if (targetIndex) {
    for (let index = 0; index < targetIndex; index++) {
      if (childNodesList[index].tagName) {
        posWidth = getRect(childNodesList[index]).width + posWidth;
        posHeight = getRect(childNodesList[index]).height + posHeight;
      }
    }
  }

  return [posWidth.toFixed(2), posHeight.toFixed(2)];
}

/* node_modules/@rubus/rubus/src/packages/Popover/Popover.svelte generated by Svelte v3.29.4 */
const file$6 = "node_modules/@rubus/rubus/src/packages/Popover/Popover.svelte";

// (620:34) 
function create_if_block_1$5(ctx) {
	let div1;
	let div0;
	let t0;
	let t1;
	let div2;
	let t2;
	let div3;
	let current;
	const default_slot_template = /*#slots*/ ctx[10].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(/*title*/ ctx[4]);
			t1 = space();
			div2 = element("div");
			if (default_slot) default_slot.c();
			t2 = space();
			div3 = element("div");
			this.h();
		},
		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			div0 = claim_element(div1_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			t0 = claim_text(div0_nodes, /*title*/ ctx[4]);
			div0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t1 = claim_space(nodes);
			div2 = claim_element(nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			if (default_slot) default_slot.l(div2_nodes);
			div2_nodes.forEach(detach_dev);
			t2 = claim_space(nodes);
			div3 = claim_element(nodes, "DIV", { class: true });
			children(div3).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "spectrum-Dialog-title");
			add_location(div0, file$6, 621, 6, 23533);
			attr_dev(div1, "class", "spectrum-Dialog-header svelte-155j3uu");
			add_location(div1, file$6, 620, 4, 23490);
			attr_dev(div2, "class", "spectrum-Dialog-content");
			add_location(div2, file$6, 623, 4, 23597);
			attr_dev(div3, "class", "spectrum-Popover-tip svelte-155j3uu");
			add_location(div3, file$6, 626, 4, 23665);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			append_dev(div0, t0);
			insert_dev(target, t1, anchor);
			insert_dev(target, div2, anchor);

			if (default_slot) {
				default_slot.m(div2, null);
			}

			insert_dev(target, t2, anchor);
			insert_dev(target, div3, anchor);
			/*div3_binding*/ ctx[11](div3);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (!current || dirty & /*title*/ 16) set_data_dev(t0, /*title*/ ctx[4]);

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 512) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
				}
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
			if (detaching) detach_dev(div1);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div2);
			if (default_slot) default_slot.d(detaching);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(div3);
			/*div3_binding*/ ctx[11](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$5.name,
		type: "if",
		source: "(620:34) ",
		ctx
	});

	return block;
}

// (618:2) {#if variants === 'menu'}
function create_if_block$5(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[10].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			if (default_slot) default_slot.l(nodes);
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 512) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
				}
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
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$5.name,
		type: "if",
		source: "(618:2) {#if variants === 'menu'}",
		ctx
	});

	return block;
}

function create_fragment$6(ctx) {
	let div0;
	let t;
	let div1;
	let current_block_type_index;
	let if_block;
	let div1_class_value;
	let current;
	const if_block_creators = [create_if_block$5, create_if_block_1$5];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*variants*/ ctx[1] === "menu") return 0;
		if (/*variants*/ ctx[1] === "dialog") return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	const block = {
		c: function create() {
			div0 = element("div");
			t = space();
			div1 = element("div");
			if (if_block) if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			div0 = claim_element(nodes, "DIV", { class: true });
			children(div0).forEach(detach_dev);
			t = claim_space(nodes);
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			if (if_block) if_block.l(div1_nodes);
			div1_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(div0, "class", "rubus-Popover-registering svelte-155j3uu");
			add_location(div0, file$6, 608, 0, 22993);

			attr_dev(div1, "class", div1_class_value = "spectrum-Popover rubus-Popover--" + (/*popverPosition*/ ctx[2] == "auto"
			? /*popverPositionAuto*/ ctx[5]
			: /*popverPosition*/ ctx[2]) + "\n    " + (/*isQuiet*/ ctx[3] && /*variants*/ ctx[1] === "menu"
			? `rubus-Popover-quiet--${/*popverPosition*/ ctx[2] == "auto"
				? /*popverPositionAuto*/ ctx[5]
				: /*popverPosition*/ ctx[2]}`
			: ``) + "\n    " + /*$$restProps*/ ctx[8].class + " svelte-155j3uu");

			toggle_class(div1, "is-open", /*isOpen*/ ctx[0]);
			toggle_class(div1, "spectrum-Popover--dialog", /*variants*/ ctx[1] === "dialog");
			add_location(div1, file$6, 610, 0, 23036);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			insert_dev(target, t, anchor);
			insert_dev(target, div1, anchor);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(div1, null);
			}

			/*div1_binding*/ ctx[12](div1);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(div1, null);
				} else {
					if_block = null;
				}
			}

			if (!current || dirty & /*popverPosition, popverPositionAuto, isQuiet, variants, $$restProps*/ 302 && div1_class_value !== (div1_class_value = "spectrum-Popover rubus-Popover--" + (/*popverPosition*/ ctx[2] == "auto"
			? /*popverPositionAuto*/ ctx[5]
			: /*popverPosition*/ ctx[2]) + "\n    " + (/*isQuiet*/ ctx[3] && /*variants*/ ctx[1] === "menu"
			? `rubus-Popover-quiet--${/*popverPosition*/ ctx[2] == "auto"
				? /*popverPositionAuto*/ ctx[5]
				: /*popverPosition*/ ctx[2]}`
			: ``) + "\n    " + /*$$restProps*/ ctx[8].class + " svelte-155j3uu")) {
				attr_dev(div1, "class", div1_class_value);
			}

			if (dirty & /*popverPosition, popverPositionAuto, isQuiet, variants, $$restProps, isOpen*/ 303) {
				toggle_class(div1, "is-open", /*isOpen*/ ctx[0]);
			}

			if (dirty & /*popverPosition, popverPositionAuto, isQuiet, variants, $$restProps, variants*/ 302) {
				toggle_class(div1, "spectrum-Popover--dialog", /*variants*/ ctx[1] === "dialog");
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(div1);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			/*div1_binding*/ ctx[12](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	const omit_props_names = ["isOpen","variants","popverPosition","isQuiet","title"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Popover", slots, ['default']);
	let { isOpen = false } = $$props;
	let { variants = "menu" } = $$props;
	let { popverPosition = "auto" } = $$props;
	let { isQuiet = false } = $$props;
	let { title = "Popover Title" } = $$props;
	let popverPositionAuto = "bottomRight";
	let popover;
	let popoverTip;
	let menuButton;
	let menuButtonWidth;
	let menuButtonHeight;
	let popoverWidth;
	let popoverHeight;
	let popoverTipWidth;
	let popoverTipHeight;

	onMount(() => {
		setCssVar();
	});

	afterUpdate(() => {
		autoPlace();
	});

	function setCssVar() {
		if (!popover.parentElement.querySelector("#rubus-ActionSource")) {
			return;
		}

		menuButton = getRect(popover.parentElement.querySelector("#rubus-ActionSource"));
		menuButtonWidth = menuButton && menuButton.width;
		menuButtonHeight = menuButton && menuButton.height;
		popoverWidth = popover && popover.offsetWidth;
		popoverHeight = popover && popover.offsetHeight;
		popoverTipWidth = popoverTip && popoverTip.offsetWidth;
		popoverTipHeight = popoverTip && popoverTip.offsetHeight;
		popover.parentElement.style.setProperty("--rubus-action-menu-button-width", menuButtonWidth + `px`);
		popover.parentElement.style.setProperty("--rubus-action-menu-button-height", menuButtonHeight + `px`);
		popover.parentElement.style.setProperty("--rubus-action-menu-popover-width", popoverWidth + `px`);
		popover.parentElement.style.setProperty("--rubus-action-menu-popover-height", popoverHeight + `px`);
		popover.parentElement.style.setProperty("--rubus-action-menu-popover-tip-width", popoverTipWidth + `px`);
		popover.parentElement.style.setProperty("--rubus-action-menu-popover-tip-height", popoverTipHeight + `px`);
	}

	function autoPlace() {
		if (variants == "menu") {
			switch (popverPosition == "auto") {
				case menuButton.x > popoverWidth && menuButton.y > popoverHeight && menuButton.right < popoverWidth && menuButton.bottom < popoverHeight:
					$$invalidate(5, popverPositionAuto = "topLeft");
					break;
				case menuButton.x < popoverWidth && menuButton.y > popoverHeight && menuButton.right > popoverWidth && menuButton.bottom < popoverHeight:
					$$invalidate(5, popverPositionAuto = "topRight");
					break;
				case menuButton.right < popoverWidth && menuButton.x > popoverWidth:
					$$invalidate(5, popverPositionAuto = "bottomLeft");
					break;
				default:
					$$invalidate(5, popverPositionAuto = "bottomRight");
			}
		}

		if (variants == "dialog") {
			switch (popverPosition == "auto") {
				case menuButton.x > popoverWidth && menuButton.right < popoverWidth:
					$$invalidate(5, popverPositionAuto = "centerLeft");
					break;
				case menuButton.x < popoverWidth && menuButton.right > popoverWidth:
					$$invalidate(5, popverPositionAuto = "centerRight");
					break;
				case menuButton.x > popoverWidth && menuButton.y > popoverHeight && menuButton.right > popoverWidth && menuButton.bottom < popoverHeight:
					$$invalidate(5, popverPositionAuto = "centerTop");
					break;
				default:
					$$invalidate(5, popverPositionAuto = "centerBottom");
			}
		}
	}

	function div3_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			popoverTip = $$value;
			$$invalidate(7, popoverTip);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			popover = $$value;
			$$invalidate(6, popover);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("isOpen" in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
		if ("variants" in $$new_props) $$invalidate(1, variants = $$new_props.variants);
		if ("popverPosition" in $$new_props) $$invalidate(2, popverPosition = $$new_props.popverPosition);
		if ("isQuiet" in $$new_props) $$invalidate(3, isQuiet = $$new_props.isQuiet);
		if ("title" in $$new_props) $$invalidate(4, title = $$new_props.title);
		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		onMount,
		getRect,
		isOpen,
		variants,
		popverPosition,
		isQuiet,
		title,
		popverPositionAuto,
		popover,
		popoverTip,
		menuButton,
		menuButtonWidth,
		menuButtonHeight,
		popoverWidth,
		popoverHeight,
		popoverTipWidth,
		popoverTipHeight,
		setCssVar,
		autoPlace
	});

	$$self.$inject_state = $$new_props => {
		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
		if ("variants" in $$props) $$invalidate(1, variants = $$new_props.variants);
		if ("popverPosition" in $$props) $$invalidate(2, popverPosition = $$new_props.popverPosition);
		if ("isQuiet" in $$props) $$invalidate(3, isQuiet = $$new_props.isQuiet);
		if ("title" in $$props) $$invalidate(4, title = $$new_props.title);
		if ("popverPositionAuto" in $$props) $$invalidate(5, popverPositionAuto = $$new_props.popverPositionAuto);
		if ("popover" in $$props) $$invalidate(6, popover = $$new_props.popover);
		if ("popoverTip" in $$props) $$invalidate(7, popoverTip = $$new_props.popoverTip);
		if ("menuButton" in $$props) menuButton = $$new_props.menuButton;
		if ("menuButtonWidth" in $$props) menuButtonWidth = $$new_props.menuButtonWidth;
		if ("menuButtonHeight" in $$props) menuButtonHeight = $$new_props.menuButtonHeight;
		if ("popoverWidth" in $$props) popoverWidth = $$new_props.popoverWidth;
		if ("popoverHeight" in $$props) popoverHeight = $$new_props.popoverHeight;
		if ("popoverTipWidth" in $$props) popoverTipWidth = $$new_props.popoverTipWidth;
		if ("popoverTipHeight" in $$props) popoverTipHeight = $$new_props.popoverTipHeight;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		isOpen,
		variants,
		popverPosition,
		isQuiet,
		title,
		popverPositionAuto,
		popover,
		popoverTip,
		$$restProps,
		$$scope,
		slots,
		div3_binding,
		div1_binding
	];
}

class Popover extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
			isOpen: 0,
			variants: 1,
			popverPosition: 2,
			isQuiet: 3,
			title: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Popover",
			options,
			id: create_fragment$6.name
		});
	}

	get isOpen() {
		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isOpen(value) {
		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get variants() {
		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set variants(value) {
		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get popverPosition() {
		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set popverPosition(value) {
		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isQuiet() {
		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isQuiet(value) {
		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get title() {
		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set title(value) {
		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

//Safari Date function polyfill
!(function (_Date) {
  function standardizeArgs(args) {
    if (args.length === 1 && typeof args[0] === "string" && isNaN(_Date.parse(args[0]))) {
      args[0] = args[0].replace(/-/g, "/");
    }
    return Array.prototype.slice.call(args);
  }

  function $Date() {
    if (this instanceof $Date) {
      return new (Function.prototype.bind.apply(_Date, [null].concat(standardizeArgs(arguments))))();
    }
    return _Date();
  }
  $Date.prototype = _Date.prototype;

  $Date.now = _Date.now;
  $Date.UTC = _Date.UTC;
  $Date.parse = function () {
    return _Date.parse.apply(_Date, standardizeArgs(arguments));
  };

  Date = $Date;
})(Date);

var colorName = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

var isArrayish = function isArrayish(obj) {
	if (!obj || typeof obj === 'string') {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && (obj.splice instanceof Function ||
			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
};

var simpleSwizzle = createCommonjsModule(function (module) {



var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};
});

var colorString = createCommonjsModule(function (module) {
/* MIT license */



var reverseNames = {};

// create a list of reverse color names
for (var name in colorName) {
	if (colorName.hasOwnProperty(name)) {
		reverseNames[colorName[name]] = name;
	}
}

var cs = module.exports = {
	to: {},
	get: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var keyword = /(\D+)/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha, 16) / 255;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		rgb = colorName[match[1]];

		if (!rgb) {
			return null;
		}

		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?(?:\d*\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = (parseFloat(match[1]) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = simpleSwizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = simpleSwizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = simpleSwizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = simpleSwizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = simpleSwizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = num.toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}
});

var colorName$1 = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

var conversions = createCommonjsModule(function (module) {
/* MIT license */


// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in colorName$1) {
	if (colorName$1.hasOwnProperty(key)) {
		reverseKeywords[colorName$1[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var rdif;
	var gdif;
	var bdif;
	var h;
	var s;

	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);
	var diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in colorName$1) {
		if (colorName$1.hasOwnProperty(keyword)) {
			var value = colorName$1[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return colorName$1[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};
});

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

var route = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

var colorConvert = convert;

var _slice = [].slice;

var skippedModels = [
  // to be honest, I don't really feel like keyword belongs in color convert, but eh.
  "keyword",

  // gray conflicts with some method names, and has its own method defined.
  "gray",

  // shouldn't really be in color-convert either...
  "hex",
];

var hashedModelKeys = {};
Object.keys(colorConvert).forEach(function (model) {
  hashedModelKeys[_slice.call(colorConvert[model].labels).sort().join("")] = model;
});

var limiters = {};

function Color(obj, model) {
  if (!(this instanceof Color)) {
    return new Color(obj, model);
  }

  if (model && model in skippedModels) {
    model = null;
  }

  if (model && !(model in colorConvert)) {
    throw new Error("Unknown model: " + model);
  }

  var i;
  var channels;

  if (obj == null) {
    // eslint-disable-line no-eq-null,eqeqeq
    this.model = "rgb";
    this.color = [0, 0, 0];
    this.valpha = 1;
  } else if (obj instanceof Color) {
    this.model = obj.model;
    this.color = obj.color.slice();
    this.valpha = obj.valpha;
  } else if (typeof obj === "string") {
    var result = colorString.get(obj);
    if (result === null) {
      throw new Error("Unable to parse color from string: " + obj);
    }

    this.model = result.model;
    channels = colorConvert[this.model].channels;
    this.color = result.value.slice(0, channels);
    this.valpha = typeof result.value[channels] === "number" ? result.value[channels] : 1;
  } else if (obj.length) {
    this.model = model || "rgb";
    channels = colorConvert[this.model].channels;
    var newArr = _slice.call(obj, 0, channels);
    this.color = zeroArray(newArr, channels);
    this.valpha = typeof obj[channels] === "number" ? obj[channels] : 1;
  } else if (typeof obj === "number") {
    // this is always RGB - can be converted later on.
    obj &= 0xffffff;
    this.model = "rgb";
    this.color = [(obj >> 16) & 0xff, (obj >> 8) & 0xff, obj & 0xff];
    this.valpha = 1;
  } else {
    this.valpha = 1;

    var keys = Object.keys(obj);
    if ("alpha" in obj) {
      keys.splice(keys.indexOf("alpha"), 1);
      this.valpha = typeof obj.alpha === "number" ? obj.alpha : 0;
    }

    var hashedKeys = keys.sort().join("");
    if (!(hashedKeys in hashedModelKeys)) {
      throw new Error("Unable to parse color from object: " + JSON.stringify(obj));
    }

    this.model = hashedModelKeys[hashedKeys];

    var labels = colorConvert[this.model].labels;
    var color = [];
    for (i = 0; i < labels.length; i++) {
      color.push(obj[labels[i]]);
    }

    this.color = zeroArray(color);
  }

  // perform limitations (clamping, etc.)
  if (limiters[this.model]) {
    channels = colorConvert[this.model].channels;
    for (i = 0; i < channels; i++) {
      var limit = limiters[this.model][i];
      if (limit) {
        this.color[i] = limit(this.color[i]);
      }
    }
  }

  this.valpha = Math.max(0, Math.min(1, this.valpha));

  if (Object.freeze) {
    Object.freeze(this);
  }
}

Color.prototype = {
  toString: function () {
    return this.string();
  },

  toJSON: function () {
    return this[this.model]();
  },

  string: function (places) {
    var self = this.model in colorString.to ? this : this.rgb();
    self = self.round(typeof places === "number" ? places : 1);
    var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
    return colorString.to[self.model](args);
  },

  percentString: function (places) {
    var self = this.rgb().round(typeof places === "number" ? places : 1);
    var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
    return colorString.to.rgb.percent(args);
  },

  array: function () {
    return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
  },

  object: function () {
    var result = {};
    var channels = colorConvert[this.model].channels;
    var labels = colorConvert[this.model].labels;

    for (var i = 0; i < channels; i++) {
      result[labels[i]] = this.color[i];
    }

    if (this.valpha !== 1) {
      result.alpha = this.valpha;
    }

    return result;
  },

  unitArray: function () {
    var rgb = this.rgb().color;
    rgb[0] /= 255;
    rgb[1] /= 255;
    rgb[2] /= 255;

    if (this.valpha !== 1) {
      rgb.push(this.valpha);
    }

    return rgb;
  },

  unitObject: function () {
    var rgb = this.rgb().object();
    rgb.r /= 255;
    rgb.g /= 255;
    rgb.b /= 255;

    if (this.valpha !== 1) {
      rgb.alpha = this.valpha;
    }

    return rgb;
  },

  round: function (places) {
    places = Math.max(places || 0, 0);
    return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
  },

  alpha: function (val) {
    if (arguments.length) {
      return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
    }

    return this.valpha;
  },

  // rgb
  red: getset("rgb", 0, maxfn(255)),
  green: getset("rgb", 1, maxfn(255)),
  blue: getset("rgb", 2, maxfn(255)),

  hue: getset(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function (val) {
    return ((val % 360) + 360) % 360;
  }), // eslint-disable-line brace-style

  saturationl: getset("hsl", 1, maxfn(100)),
  lightness: getset("hsl", 2, maxfn(100)),

  saturationv: getset("hsv", 1, maxfn(100)),
  value: getset("hsv", 2, maxfn(100)),

  chroma: getset("hcg", 1, maxfn(100)),
  gray: getset("hcg", 2, maxfn(100)),

  white: getset("hwb", 1, maxfn(100)),
  wblack: getset("hwb", 2, maxfn(100)),

  cyan: getset("cmyk", 0, maxfn(100)),
  magenta: getset("cmyk", 1, maxfn(100)),
  yellow: getset("cmyk", 2, maxfn(100)),
  black: getset("cmyk", 3, maxfn(100)),

  x: getset("xyz", 0, maxfn(100)),
  y: getset("xyz", 1, maxfn(100)),
  z: getset("xyz", 2, maxfn(100)),

  l: getset("lab", 0, maxfn(100)),
  a: getset("lab", 1),
  b: getset("lab", 2),

  keyword: function (val) {
    if (arguments.length) {
      return new Color(val);
    }

    return colorConvert[this.model].keyword(this.color);
  },

  hex: function (val) {
    if (arguments.length) {
      return new Color(val);
    }

    return colorString.to.hex(this.rgb().round().color);
  },

  rgbNumber: function () {
    var rgb = this.rgb().color;
    return ((rgb[0] & 0xff) << 16) | ((rgb[1] & 0xff) << 8) | (rgb[2] & 0xff);
  },

  luminosity: function () {
    // http://www.w3.org/TR/WCAG20/#relativeluminancedef
    var rgb = this.rgb().color;

    var lum = [];
    for (var i = 0; i < rgb.length; i++) {
      var chan = rgb[i] / 255;
      lum[i] = chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
    }

    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
  },

  contrast: function (color2) {
    // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
    var lum1 = this.luminosity();
    var lum2 = color2.luminosity();

    if (lum1 > lum2) {
      return (lum1 + 0.05) / (lum2 + 0.05);
    }

    return (lum2 + 0.05) / (lum1 + 0.05);
  },

  level: function (color2) {
    var contrastRatio = this.contrast(color2);
    if (contrastRatio >= 7.1) {
      return "AAA";
    }

    return contrastRatio >= 4.5 ? "AA" : "";
  },

  isDark: function () {
    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
    var rgb = this.rgb().color;
    var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return yiq < 128;
  },

  isLight: function () {
    return !this.isDark();
  },

  negate: function () {
    var rgb = this.rgb();
    for (var i = 0; i < 3; i++) {
      rgb.color[i] = 255 - rgb.color[i];
    }
    return rgb;
  },

  lighten: function (ratio) {
    var hsl = this.hsl();
    hsl.color[2] += hsl.color[2] * ratio;
    return hsl;
  },

  darken: function (ratio) {
    var hsl = this.hsl();
    hsl.color[2] -= hsl.color[2] * ratio;
    return hsl;
  },

  saturate: function (ratio) {
    var hsl = this.hsl();
    hsl.color[1] += hsl.color[1] * ratio;
    return hsl;
  },

  desaturate: function (ratio) {
    var hsl = this.hsl();
    hsl.color[1] -= hsl.color[1] * ratio;
    return hsl;
  },

  whiten: function (ratio) {
    var hwb = this.hwb();
    hwb.color[1] += hwb.color[1] * ratio;
    return hwb;
  },

  blacken: function (ratio) {
    var hwb = this.hwb();
    hwb.color[2] += hwb.color[2] * ratio;
    return hwb;
  },

  grayscale: function () {
    // http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
    var rgb = this.rgb().color;
    var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
    return Color.rgb(val, val, val);
  },

  fade: function (ratio) {
    return this.alpha(this.valpha - this.valpha * ratio);
  },

  opaquer: function (ratio) {
    return this.alpha(this.valpha + this.valpha * ratio);
  },

  rotate: function (degrees) {
    var hsl = this.hsl();
    var hue = hsl.color[0];
    hue = (hue + degrees) % 360;
    hue = hue < 0 ? 360 + hue : hue;
    hsl.color[0] = hue;
    return hsl;
  },

  mix: function (mixinColor, weight) {
    // ported from sass implementation in C
    // https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
    if (!mixinColor || !mixinColor.rgb) {
      throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
    }
    var color1 = mixinColor.rgb();
    var color2 = this.rgb();
    var p = weight === undefined ? 0.5 : weight;

    var w = 2 * p - 1;
    var a = color1.alpha() - color2.alpha();

    var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
    var w2 = 1 - w1;

    return Color.rgb(
      w1 * color1.red() + w2 * color2.red(),
      w1 * color1.green() + w2 * color2.green(),
      w1 * color1.blue() + w2 * color2.blue(),
      color1.alpha() * p + color2.alpha() * (1 - p)
    );
  },
};

// model conversion methods and static constructors
Object.keys(colorConvert).forEach(function (model) {
  if (skippedModels.indexOf(model) !== -1) {
    return;
  }

  var channels = colorConvert[model].channels;

  // conversion methods
  Color.prototype[model] = function () {
    if (this.model === model) {
      return new Color(this);
    }

    if (arguments.length) {
      return new Color(arguments, model);
    }

    var newAlpha = typeof arguments[channels] === "number" ? channels : this.valpha;
    return new Color(assertArray(colorConvert[this.model][model].raw(this.color)).concat(newAlpha), model);
  };

  // 'static' construction methods
  Color[model] = function (color) {
    if (typeof color === "number") {
      color = zeroArray(_slice.call(arguments), channels);
    }
    return new Color(color, model);
  };
});

function roundTo(num, places) {
  return Number(num.toFixed(places));
}

function roundToPlace(places) {
  return function (num) {
    return roundTo(num, places);
  };
}

function getset(model, channel, modifier) {
  model = Array.isArray(model) ? model : [model];

  model.forEach(function (m) {
    (limiters[m] || (limiters[m] = []))[channel] = modifier;
  });

  model = model[0];

  return function (val) {
    var result;

    if (arguments.length) {
      if (modifier) {
        val = modifier(val);
      }

      result = this[model]();
      result.color[channel] = val;
      return result;
    }

    result = this[model]().color[channel];
    if (modifier) {
      result = modifier(result);
    }

    return result;
  };
}

function maxfn(max) {
  return function (v) {
    return Math.max(0, Math.min(max, v));
  };
}

function assertArray(val) {
  return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
  for (var i = 0; i < length; i++) {
    if (typeof arr[i] !== "number") {
      arr[i] = 0;
    }
  }

  return arr;
}

/* node_modules/@rubus/rubus/src/packages/Cornerstone/Cornerstone.svelte generated by Svelte v3.29.4 */

const { Object: Object_1, document: document_1 } = globals;
const file$7 = "node_modules/@rubus/rubus/src/packages/Cornerstone/Cornerstone.svelte";

function create_fragment$7(ctx) {
	let meta;
	let meta_content_value;
	let t;
	let current;
	const default_slot_template = /*#slots*/ ctx[9].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

	const block = {
		c: function create() {
			meta = element("meta");
			t = space();
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all("[data-svelte=\"svelte-1l4uhp4\"]", document_1.head);
			meta = claim_element(head_nodes, "META", { name: true, content: true });
			head_nodes.forEach(detach_dev);
			t = claim_space(nodes);
			if (default_slot) default_slot.l(nodes);
			this.h();
		},
		h: function hydrate() {
			attr_dev(meta, "name", "theme-color");
			attr_dev(meta, "content", meta_content_value = /*themeColor*/ ctx[0] || /*themeBgColor*/ ctx[1]);
			add_location(meta, file$7, 96, 2, 2557);
		},
		m: function mount(target, anchor) {
			append_dev(document_1.head, meta);
			insert_dev(target, t, anchor);

			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*themeColor, themeBgColor*/ 3 && meta_content_value !== (meta_content_value = /*themeColor*/ ctx[0] || /*themeBgColor*/ ctx[1])) {
				attr_dev(meta, "content", meta_content_value);
			}

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 256) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
				}
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
			detach_dev(meta);
			if (detaching) detach_dev(t);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function resetCssVariables(array) {
	if (!array) {
		return;
	}

	let cssVariablesName;

	for (let index = 0; index < array.length; index++) {
		cssVariablesName = Object.getOwnPropertyNames(array[index]);
		document.documentElement.style.setProperty(cssVariablesName, array[index][cssVariablesName]);
	}
}

function resetCssContent(contentText) {
	if (!contentText) {
		return;
	}

	var sheet = document.createElement("style");
	sheet.innerHTML = contentText;
	document.head.appendChild(sheet);
}

function instance$7($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Cornerstone", slots, ['default']);
	let { spectrumScale = "medium" } = $$props;
	let { spectrumTheme = "dark" } = $$props;
	let { resetCss = [] } = $$props;
	let { resetCssText = "" } = $$props;
	let { themeColor = undefined } = $$props;
	let { language = "en" } = $$props;
	let { languageReadingOrder = "ltr" } = $$props;
	let themeBgColor = "#cccccc";

	onMount(() => {
		setDocumentElementProperty();
		resetCssContent(resetCssText);
	});

	afterUpdate(() => {
		Promise.all([import('./index.2c0d2fc8.js'), ]).then(function(x) { return x[0]; });
	});

	beforeUpdate(() => {
		setDocumentElementProperty();
		resetCssVariables(resetCss);
		getThemeBgColor();
	});

	function setDocumentElementProperty() {
		document.documentElement.className = `spectrum spectrum--${spectrumScale} spectrum--${spectrumTheme}`;
		document.documentElement.lang = language;
		document.documentElement.dir = languageReadingOrder;
	}

	function getThemeBgColor() {
		$$invalidate(1, themeBgColor = getComputedStyle(document.documentElement).getPropertyValue("--spectrum-alias-background-color-default"));
	}

	const writable_props = [
		"spectrumScale",
		"spectrumTheme",
		"resetCss",
		"resetCssText",
		"themeColor",
		"language",
		"languageReadingOrder"
	];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cornerstone> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("spectrumScale" in $$props) $$invalidate(2, spectrumScale = $$props.spectrumScale);
		if ("spectrumTheme" in $$props) $$invalidate(3, spectrumTheme = $$props.spectrumTheme);
		if ("resetCss" in $$props) $$invalidate(4, resetCss = $$props.resetCss);
		if ("resetCssText" in $$props) $$invalidate(5, resetCssText = $$props.resetCssText);
		if ("themeColor" in $$props) $$invalidate(0, themeColor = $$props.themeColor);
		if ("language" in $$props) $$invalidate(6, language = $$props.language);
		if ("languageReadingOrder" in $$props) $$invalidate(7, languageReadingOrder = $$props.languageReadingOrder);
		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		spectrumScale,
		spectrumTheme,
		resetCss,
		resetCssText,
		themeColor,
		language,
		languageReadingOrder,
		onMount,
		beforeUpdate,
		afterUpdate,
		themeBgColor,
		setDocumentElementProperty,
		resetCssVariables,
		resetCssContent,
		getThemeBgColor
	});

	$$self.$inject_state = $$props => {
		if ("spectrumScale" in $$props) $$invalidate(2, spectrumScale = $$props.spectrumScale);
		if ("spectrumTheme" in $$props) $$invalidate(3, spectrumTheme = $$props.spectrumTheme);
		if ("resetCss" in $$props) $$invalidate(4, resetCss = $$props.resetCss);
		if ("resetCssText" in $$props) $$invalidate(5, resetCssText = $$props.resetCssText);
		if ("themeColor" in $$props) $$invalidate(0, themeColor = $$props.themeColor);
		if ("language" in $$props) $$invalidate(6, language = $$props.language);
		if ("languageReadingOrder" in $$props) $$invalidate(7, languageReadingOrder = $$props.languageReadingOrder);
		if ("themeBgColor" in $$props) $$invalidate(1, themeBgColor = $$props.themeBgColor);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		themeColor,
		themeBgColor,
		spectrumScale,
		spectrumTheme,
		resetCss,
		resetCssText,
		language,
		languageReadingOrder,
		$$scope,
		slots
	];
}

class Cornerstone extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
			spectrumScale: 2,
			spectrumTheme: 3,
			resetCss: 4,
			resetCssText: 5,
			themeColor: 0,
			language: 6,
			languageReadingOrder: 7
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Cornerstone",
			options,
			id: create_fragment$7.name
		});
	}

	get spectrumScale() {
		throw new Error("<Cornerstone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set spectrumScale(value) {
		throw new Error("<Cornerstone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get spectrumTheme() {
		throw new Error("<Cornerstone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set spectrumTheme(value) {
		throw new Error("<Cornerstone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get resetCss() {
		throw new Error("<Cornerstone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set resetCss(value) {
		throw new Error("<Cornerstone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get resetCssText() {
		throw new Error("<Cornerstone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set resetCssText(value) {
		throw new Error("<Cornerstone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get themeColor() {
		throw new Error("<Cornerstone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set themeColor(value) {
		throw new Error("<Cornerstone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get language() {
		throw new Error("<Cornerstone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set language(value) {
		throw new Error("<Cornerstone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get languageReadingOrder() {
		throw new Error("<Cornerstone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set languageReadingOrder(value) {
		throw new Error("<Cornerstone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/@rubus/rubus/src/packages/Menu/Menu.svelte generated by Svelte v3.29.4 */
const file$8 = "node_modules/@rubus/rubus/src/packages/Menu/Menu.svelte";

function create_fragment$8(ctx) {
	let ul;
	let current;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

	const block = {
		c: function create() {
			ul = element("ul");
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			ul = claim_element(nodes, "UL", {
				class: true,
				role: true,
				style: true,
				"aria-labelledby": true
			});

			var ul_nodes = children(ul);
			if (default_slot) default_slot.l(ul_nodes);
			ul_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(ul, "class", "spectrum-Menu svelte-1qphbsz");
			attr_dev(ul, "role", /*role*/ ctx[0]);
			attr_dev(ul, "style", /*styleCssText*/ ctx[4]);
			attr_dev(ul, "aria-labelledby", /*ariaLabelledby*/ ctx[1]);
			toggle_class(ul, "spectrum-Menu-nested", /*nested*/ ctx[2]);
			add_location(ul, file$8, 97, 0, 2333);
		},
		m: function mount(target, anchor) {
			insert_dev(target, ul, anchor);

			if (default_slot) {
				default_slot.m(ul, null);
			}

			/*ul_binding*/ ctx[9](ul);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 128) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
				}
			}

			if (!current || dirty & /*role*/ 1) {
				attr_dev(ul, "role", /*role*/ ctx[0]);
			}

			if (!current || dirty & /*styleCssText*/ 16) {
				attr_dev(ul, "style", /*styleCssText*/ ctx[4]);
			}

			if (!current || dirty & /*ariaLabelledby*/ 2) {
				attr_dev(ul, "aria-labelledby", /*ariaLabelledby*/ ctx[1]);
			}

			if (dirty & /*nested*/ 4) {
				toggle_class(ul, "spectrum-Menu-nested", /*nested*/ ctx[2]);
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
			if (detaching) detach_dev(ul);
			if (default_slot) default_slot.d(detaching);
			/*ul_binding*/ ctx[9](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Menu", slots, ['default']);
	let { role = "menu" } = $$props;
	let { maxWidth = 0 } = $$props;
	let { minWidth = 0 } = $$props;
	let { ariaLabelledby = "" } = $$props;
	let { nested = false } = $$props;
	let menuEl;
	let menuWidth;

	afterUpdate(() => {
		if (menuEl) {
			nested && resetPosition();
			$$invalidate(10, menuWidth = setWidth().width);
		}
	});

	onMount(() => {
		nested && window.addEventListener("click", listenForChildClicks);
	});

	function listenForChildClicks(e) {
		let prevNode = menuEl.previousElementSibling;

		if (prevNode && prevNode.contains(e.target)) {
			menuEl.previousElementSibling && resetPosition();
		}
	}

	let getInTheBoxPositionTop = 0;
	let getInTheBoxPositionLeft = 0;

	function resetPosition() {
		let prevNode = menuEl.previousElementSibling;

		if (prevNode) {
			let openItem = prevNode.querySelector(".spectrum-Menu-item.is-open");
			$$invalidate(12, getInTheBoxPositionLeft = getRect(prevNode).width);
			$$invalidate(11, [,getInTheBoxPositionTop] = getInTheBoxPosition(prevNode, openItem), getInTheBoxPositionTop);
		}
	}

	function setWidth() {
		let thisMenu = menuEl.parentElement.parentElement.querySelector("#rubus-ActionSource");

		if (thisMenu) {
			return getRect(thisMenu);
		} else {
			return { width: 0 };
		}
	}

	const writable_props = ["role", "maxWidth", "minWidth", "ariaLabelledby", "nested"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
	});

	function ul_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			menuEl = $$value;
			$$invalidate(3, menuEl);
		});
	}

	$$self.$$set = $$props => {
		if ("role" in $$props) $$invalidate(0, role = $$props.role);
		if ("maxWidth" in $$props) $$invalidate(5, maxWidth = $$props.maxWidth);
		if ("minWidth" in $$props) $$invalidate(6, minWidth = $$props.minWidth);
		if ("ariaLabelledby" in $$props) $$invalidate(1, ariaLabelledby = $$props.ariaLabelledby);
		if ("nested" in $$props) $$invalidate(2, nested = $$props.nested);
		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		afterUpdate,
		onMount,
		getRect,
		getInTheBoxPosition,
		role,
		maxWidth,
		minWidth,
		ariaLabelledby,
		nested,
		menuEl,
		menuWidth,
		listenForChildClicks,
		getInTheBoxPositionTop,
		getInTheBoxPositionLeft,
		resetPosition,
		setWidth,
		styleCssText
	});

	$$self.$inject_state = $$props => {
		if ("role" in $$props) $$invalidate(0, role = $$props.role);
		if ("maxWidth" in $$props) $$invalidate(5, maxWidth = $$props.maxWidth);
		if ("minWidth" in $$props) $$invalidate(6, minWidth = $$props.minWidth);
		if ("ariaLabelledby" in $$props) $$invalidate(1, ariaLabelledby = $$props.ariaLabelledby);
		if ("nested" in $$props) $$invalidate(2, nested = $$props.nested);
		if ("menuEl" in $$props) $$invalidate(3, menuEl = $$props.menuEl);
		if ("menuWidth" in $$props) $$invalidate(10, menuWidth = $$props.menuWidth);
		if ("getInTheBoxPositionTop" in $$props) $$invalidate(11, getInTheBoxPositionTop = $$props.getInTheBoxPositionTop);
		if ("getInTheBoxPositionLeft" in $$props) $$invalidate(12, getInTheBoxPositionLeft = $$props.getInTheBoxPositionLeft);
		if ("styleCssText" in $$props) $$invalidate(4, styleCssText = $$props.styleCssText);
	};

	let styleCssText;

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*maxWidth, menuWidth, minWidth, nested, getInTheBoxPositionTop, getInTheBoxPositionLeft*/ 7268) {
			 $$invalidate(4, styleCssText = [
				maxWidth
				? `max-width:${maxWidth}px;`
				: `max-width:${menuWidth}px;`,
				minWidth
				? `min-width:${minWidth}px;`
				: `min-width:${menuWidth}px;`,
				nested && `top:${getInTheBoxPositionTop}px;`,
				nested && `left:${getInTheBoxPositionLeft}px;`
			].filter(Boolean).join(" "));
		}
	};

	return [
		role,
		ariaLabelledby,
		nested,
		menuEl,
		styleCssText,
		maxWidth,
		minWidth,
		$$scope,
		slots,
		ul_binding
	];
}

class Menu extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			role: 0,
			maxWidth: 5,
			minWidth: 6,
			ariaLabelledby: 1,
			nested: 2
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Menu",
			options,
			id: create_fragment$8.name
		});
	}

	get role() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set role(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get maxWidth() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set maxWidth(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get minWidth() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set minWidth(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaLabelledby() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaLabelledby(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get nested() {
		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set nested(value) {
		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/@rubus/rubus/src/packages/Menu/MenuItem.svelte generated by Svelte v3.29.4 */

const file$9 = "node_modules/@rubus/rubus/src/packages/Menu/MenuItem.svelte";

// (88:0) {:else}
function create_else_block$1(ctx) {
	let li;
	let t;
	let current_block_type_index;
	let if_block;
	let eventsListen_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[13].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
	const default_slot_or_fallback = default_slot || fallback_block(ctx);
	const if_block_creators = [create_if_block_1$6, create_if_block_2$1];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*nested*/ ctx[9] && (/*isSelected*/ ctx[2] || /*resultIndex*/ ctx[0] === /*thisIndex*/ ctx[5])) return 0;
		if (/*showCheckmark*/ ctx[8]) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type_1(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	const block = {
		c: function create() {
			li = element("li");
			if (default_slot_or_fallback) default_slot_or_fallback.c();
			t = space();
			if (if_block) if_block.c();
			this.h();
		},
		l: function claim(nodes) {
			li = claim_element(nodes, "LI", { class: true, role: true, tabindex: true });
			var li_nodes = children(li);
			if (default_slot_or_fallback) default_slot_or_fallback.l(li_nodes);
			t = claim_space(li_nodes);
			if (if_block) if_block.l(li_nodes);
			li_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(li, "class", "spectrum-Menu-item svelte-wp5wyr");
			attr_dev(li, "role", /*role*/ ctx[7]);
			attr_dev(li, "tabindex", /*tabindex*/ ctx[6]);
			toggle_class(li, "is-selected", !/*nested*/ ctx[9] && (/*isSelected*/ ctx[2] || /*resultIndex*/ ctx[0] === /*thisIndex*/ ctx[5]));
			toggle_class(li, "is-disabled", /*disabled*/ ctx[3]);
			toggle_class(li, "is-open", /*nested*/ ctx[9] && (/*isSelected*/ ctx[2] || /*resultIndex*/ ctx[0] === /*thisIndex*/ ctx[5]));
			add_location(li, file$9, 88, 2, 1895);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);

			if (default_slot_or_fallback) {
				default_slot_or_fallback.m(li, null);
			}

			append_dev(li, t);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(li, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(
						li,
						"click",
						function () {
							if (is_function(!/*disabled*/ ctx[3] && /*dropdownPick*/ ctx[11])) (!/*disabled*/ ctx[3] && /*dropdownPick*/ ctx[11]).apply(this, arguments);
						},
						false,
						false,
						false
					),
					action_destroyer(eventsListen_action = /*eventsListen*/ ctx[10].call(null, li))
				];

				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 4096) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
				}
			} else {
				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*label*/ 2) {
					default_slot_or_fallback.p(ctx, dirty);
				}
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(li, null);
				} else {
					if_block = null;
				}
			}

			if (!current || dirty & /*role*/ 128) {
				attr_dev(li, "role", /*role*/ ctx[7]);
			}

			if (!current || dirty & /*tabindex*/ 64) {
				attr_dev(li, "tabindex", /*tabindex*/ ctx[6]);
			}

			if (dirty & /*nested, isSelected, resultIndex, thisIndex*/ 549) {
				toggle_class(li, "is-selected", !/*nested*/ ctx[9] && (/*isSelected*/ ctx[2] || /*resultIndex*/ ctx[0] === /*thisIndex*/ ctx[5]));
			}

			if (dirty & /*disabled*/ 8) {
				toggle_class(li, "is-disabled", /*disabled*/ ctx[3]);
			}

			if (dirty & /*nested, isSelected, resultIndex, thisIndex*/ 549) {
				toggle_class(li, "is-open", /*nested*/ ctx[9] && (/*isSelected*/ ctx[2] || /*resultIndex*/ ctx[0] === /*thisIndex*/ ctx[5]));
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot_or_fallback, local);
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot_or_fallback, local);
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$1.name,
		type: "else",
		source: "(88:0) {:else}",
		ctx
	});

	return block;
}

// (86:0) {#if isDivider}
function create_if_block$6(ctx) {
	let li;

	const block = {
		c: function create() {
			li = element("li");
			this.h();
		},
		l: function claim(nodes) {
			li = claim_element(nodes, "LI", { class: true, role: true });
			children(li).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(li, "class", "spectrum-Menu-divider");
			attr_dev(li, "role", "separator");
			add_location(li, file$9, 86, 2, 1831);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$6.name,
		type: "if",
		source: "(86:0) {#if isDivider}",
		ctx
	});

	return block;
}

// (98:10) <span class="spectrum-Menu-itemLabel">
function fallback_block(ctx) {
	let span;
	let t;

	const block = {
		c: function create() {
			span = element("span");
			t = text(/*label*/ ctx[1]);
			this.h();
		},
		l: function claim(nodes) {
			span = claim_element(nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			t = claim_text(span_nodes, /*label*/ ctx[1]);
			span_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", "spectrum-Menu-itemLabel");
			add_location(span, file$9, 97, 10, 2211);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: fallback_block.name,
		type: "fallback",
		source: "(98:10) <span class=\\\"spectrum-Menu-itemLabel\\\">",
		ctx
	});

	return block;
}

// (107:28) 
function create_if_block_2$1(ctx) {
	let iconcheckmarkmedium;
	let current;

	iconcheckmarkmedium = new CheckmarkMedium({
			props: {
				className: "spectrum-Menu-checkmark spectrum-Menu-itemIcon",
				focusable: "false",
				width: "12",
				height: "12",
				"aria-hidden": /*isSelected*/ ctx[2]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(iconcheckmarkmedium.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(iconcheckmarkmedium.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(iconcheckmarkmedium, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const iconcheckmarkmedium_changes = {};
			if (dirty & /*isSelected*/ 4) iconcheckmarkmedium_changes["aria-hidden"] = /*isSelected*/ ctx[2];
			iconcheckmarkmedium.$set(iconcheckmarkmedium_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(iconcheckmarkmedium.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(iconcheckmarkmedium.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(iconcheckmarkmedium, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$1.name,
		type: "if",
		source: "(107:28) ",
		ctx
	});

	return block;
}

// (99:4) {#if nested && (isSelected || resultIndex === thisIndex)}
function create_if_block_1$6(ctx) {
	let iconchevronrightmedium;
	let current;

	iconchevronrightmedium = new ChevronRightMedium({
			props: {
				className: "spectrum-UIIcon-ChevronRightMedium spectrum-Menu-chevron spectrum-Menu-itemIcon",
				focusable: "false",
				width: "6",
				height: "10",
				"aria-hidden": /*isSelected*/ ctx[2],
				"aria-label": "Next"
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(iconchevronrightmedium.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(iconchevronrightmedium.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(iconchevronrightmedium, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const iconchevronrightmedium_changes = {};
			if (dirty & /*isSelected*/ 4) iconchevronrightmedium_changes["aria-hidden"] = /*isSelected*/ ctx[2];
			iconchevronrightmedium.$set(iconchevronrightmedium_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(iconchevronrightmedium.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(iconchevronrightmedium.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(iconchevronrightmedium, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$6.name,
		type: "if",
		source: "(99:4) {#if nested && (isSelected || resultIndex === thisIndex)}",
		ctx
	});

	return block;
}

function create_fragment$9(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$6, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*isDivider*/ ctx[4]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			if_block.l(nodes);
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$9.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$9($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("MenuItem", slots, ['default']);
	let { label = "" } = $$props;
	let { isSelected = false } = $$props;
	let { disabled = false } = $$props;
	let { isDivider = false } = $$props;
	let { resultIndex = 0 } = $$props;
	let { thisIndex = 0 } = $$props;
	let { tabindex = 0 } = $$props;
	let { role = "menuitem" } = $$props;
	let { showCheckmark = true } = $$props;
	let { nested = false } = $$props;
	const eventsListen = getEventsAction(current_component);

	function dropdownPick() {
		$$invalidate(0, resultIndex = thisIndex);
	}

	const writable_props = [
		"label",
		"isSelected",
		"disabled",
		"isDivider",
		"resultIndex",
		"thisIndex",
		"tabindex",
		"role",
		"showCheckmark",
		"nested"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuItem> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("label" in $$props) $$invalidate(1, label = $$props.label);
		if ("isSelected" in $$props) $$invalidate(2, isSelected = $$props.isSelected);
		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
		if ("isDivider" in $$props) $$invalidate(4, isDivider = $$props.isDivider);
		if ("resultIndex" in $$props) $$invalidate(0, resultIndex = $$props.resultIndex);
		if ("thisIndex" in $$props) $$invalidate(5, thisIndex = $$props.thisIndex);
		if ("tabindex" in $$props) $$invalidate(6, tabindex = $$props.tabindex);
		if ("role" in $$props) $$invalidate(7, role = $$props.role);
		if ("showCheckmark" in $$props) $$invalidate(8, showCheckmark = $$props.showCheckmark);
		if ("nested" in $$props) $$invalidate(9, nested = $$props.nested);
		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		current_component,
		getEventsAction,
		IconCheckmarkMedium: CheckmarkMedium,
		IconChevronRightMedium: ChevronRightMedium,
		label,
		isSelected,
		disabled,
		isDivider,
		resultIndex,
		thisIndex,
		tabindex,
		role,
		showCheckmark,
		nested,
		eventsListen,
		dropdownPick
	});

	$$self.$inject_state = $$props => {
		if ("label" in $$props) $$invalidate(1, label = $$props.label);
		if ("isSelected" in $$props) $$invalidate(2, isSelected = $$props.isSelected);
		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
		if ("isDivider" in $$props) $$invalidate(4, isDivider = $$props.isDivider);
		if ("resultIndex" in $$props) $$invalidate(0, resultIndex = $$props.resultIndex);
		if ("thisIndex" in $$props) $$invalidate(5, thisIndex = $$props.thisIndex);
		if ("tabindex" in $$props) $$invalidate(6, tabindex = $$props.tabindex);
		if ("role" in $$props) $$invalidate(7, role = $$props.role);
		if ("showCheckmark" in $$props) $$invalidate(8, showCheckmark = $$props.showCheckmark);
		if ("nested" in $$props) $$invalidate(9, nested = $$props.nested);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		resultIndex,
		label,
		isSelected,
		disabled,
		isDivider,
		thisIndex,
		tabindex,
		role,
		showCheckmark,
		nested,
		eventsListen,
		dropdownPick,
		$$scope,
		slots
	];
}

class MenuItem extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
			label: 1,
			isSelected: 2,
			disabled: 3,
			isDivider: 4,
			resultIndex: 0,
			thisIndex: 5,
			tabindex: 6,
			role: 7,
			showCheckmark: 8,
			nested: 9
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "MenuItem",
			options,
			id: create_fragment$9.name
		});
	}

	get label() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set label(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isSelected() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isSelected(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get disabled() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isDivider() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isDivider(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get resultIndex() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set resultIndex(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get thisIndex() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set thisIndex(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get tabindex() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set tabindex(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get role() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set role(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showCheckmark() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showCheckmark(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get nested() {
		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set nested(value) {
		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/@rubus/rubus/src/packages/Dropdown/Dropdown.svelte generated by Svelte v3.29.4 */
const file$a = "node_modules/@rubus/rubus/src/packages/Dropdown/Dropdown.svelte";
const get_dropdown_label_slot_changes = dirty => ({});
const get_dropdown_label_slot_context = ctx => ({});

// (156:4) {:else}
function create_else_block$2(ctx) {
	let html_tag;
	let html_anchor;

	const block = {
		c: function create() {
			html_anchor = empty();
			this.h();
		},
		l: function claim(nodes) {
			html_anchor = empty();
			this.h();
		},
		h: function hydrate() {
			html_tag = new HtmlTag(html_anchor);
		},
		m: function mount(target, anchor) {
			html_tag.m(/*triggerNode*/ ctx[8], target, anchor);
			insert_dev(target, html_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*triggerNode*/ 256) html_tag.p(/*triggerNode*/ ctx[8]);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(html_anchor);
			if (detaching) html_tag.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$2.name,
		type: "else",
		source: "(156:4) {:else}",
		ctx
	});

	return block;
}

// (152:4) {#if !triggerNode}
function create_if_block_1$7(ctx) {
	let span;
	let current;
	const dropdown_label_slot_template = /*#slots*/ ctx[13]["dropdown-label"];
	const dropdown_label_slot = create_slot(dropdown_label_slot_template, ctx, /*$$scope*/ ctx[15], get_dropdown_label_slot_context);
	const dropdown_label_slot_or_fallback = dropdown_label_slot || fallback_block$1(ctx);

	const block = {
		c: function create() {
			span = element("span");
			if (dropdown_label_slot_or_fallback) dropdown_label_slot_or_fallback.c();
			this.h();
		},
		l: function claim(nodes) {
			span = claim_element(nodes, "SPAN", { class: true });
			var span_nodes = children(span);
			if (dropdown_label_slot_or_fallback) dropdown_label_slot_or_fallback.l(span_nodes);
			span_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", "spectrum-Dropdown-label");
			toggle_class(span, "is-placeholder", !/*isActive*/ ctx[6] && /*placeholder*/ ctx[1]);
			add_location(span, file$a, 152, 6, 4266);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);

			if (dropdown_label_slot_or_fallback) {
				dropdown_label_slot_or_fallback.m(span, null);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (dropdown_label_slot) {
				if (dropdown_label_slot.p && dirty & /*$$scope*/ 32768) {
					update_slot(dropdown_label_slot, dropdown_label_slot_template, ctx, /*$$scope*/ ctx[15], dirty, get_dropdown_label_slot_changes, get_dropdown_label_slot_context);
				}
			} else {
				if (dropdown_label_slot_or_fallback && dropdown_label_slot_or_fallback.p && dirty & /*placeholder*/ 2) {
					dropdown_label_slot_or_fallback.p(ctx, dirty);
				}
			}

			if (dirty & /*isActive, placeholder*/ 66) {
				toggle_class(span, "is-placeholder", !/*isActive*/ ctx[6] && /*placeholder*/ ctx[1]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(dropdown_label_slot_or_fallback, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(dropdown_label_slot_or_fallback, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
			if (dropdown_label_slot_or_fallback) dropdown_label_slot_or_fallback.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$7.name,
		type: "if",
		source: "(152:4) {#if !triggerNode}",
		ctx
	});

	return block;
}

// (154:36) {placeholder}
function fallback_block$1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text(/*placeholder*/ ctx[1]);
		},
		l: function claim(nodes) {
			t = claim_text(nodes, /*placeholder*/ ctx[1]);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*placeholder*/ 2) set_data_dev(t, /*placeholder*/ ctx[1]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: fallback_block$1.name,
		type: "fallback",
		source: "(154:36) {placeholder}",
		ctx
	});

	return block;
}

// (159:4) {#if isInvalid}
function create_if_block$7(ctx) {
	let iconalertmedium;
	let current;

	iconalertmedium = new AlertMedium({
			props: {
				focusable: "false",
				"aria-hidden": "true",
				"aria-label": "Folder"
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(iconalertmedium.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(iconalertmedium.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(iconalertmedium, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(iconalertmedium.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(iconalertmedium.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(iconalertmedium, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$7.name,
		type: "if",
		source: "(159:4) {#if isInvalid}",
		ctx
	});

	return block;
}

// (166:4) <Menu role="listbox" {minWidth}>
function create_default_slot_1(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[13].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			if (default_slot) default_slot.l(nodes);
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 32768) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
				}
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
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(166:4) <Menu role=\\\"listbox\\\" {minWidth}>",
		ctx
	});

	return block;
}

// (165:2) <Popover class="spectrum-Dropdown-popover" {isOpen}>
function create_default_slot(ctx) {
	let menu;
	let current;

	menu = new Menu({
			props: {
				role: "listbox",
				minWidth: /*minWidth*/ ctx[5],
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(menu.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(menu.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(menu, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const menu_changes = {};
			if (dirty & /*minWidth*/ 32) menu_changes.minWidth = /*minWidth*/ ctx[5];

			if (dirty & /*$$scope*/ 32768) {
				menu_changes.$$scope = { dirty, ctx };
			}

			menu.$set(menu_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(menu.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(menu.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(menu, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(165:2) <Popover class=\\\"spectrum-Dropdown-popover\\\" {isOpen}>",
		ctx
	});

	return block;
}

function create_fragment$a(ctx) {
	let div1;
	let button;
	let current_block_type_index;
	let if_block0;
	let t0;
	let t1;
	let iconchevrondownmedium;
	let t2;
	let popover;
	let t3;
	let div0;
	let current;
	let mounted;
	let dispose;
	const if_block_creators = [create_if_block_1$7, create_else_block$2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*triggerNode*/ ctx[8]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	let if_block1 = /*isInvalid*/ ctx[3] && create_if_block$7(ctx);

	iconchevrondownmedium = new ChevronDownMedium({
			props: {
				className: "spectrum-Dropdown-icon",
				focusable: "false",
				"aria-hidden": "true"
			},
			$$inline: true
		});

	popover = new Popover({
			props: {
				class: "spectrum-Dropdown-popover",
				isOpen: /*isOpen*/ ctx[0],
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div1 = element("div");
			button = element("button");
			if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			create_component(iconchevrondownmedium.$$.fragment);
			t2 = space();
			create_component(popover.$$.fragment);
			t3 = space();
			div0 = element("div");
			this.h();
		},
		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);

			button = claim_element(div1_nodes, "BUTTON", {
				class: true,
				"aria-haspopup": true,
				id: true,
				style: true
			});

			var button_nodes = children(button);
			if_block0.l(button_nodes);
			t0 = claim_space(button_nodes);
			if (if_block1) if_block1.l(button_nodes);
			t1 = claim_space(button_nodes);
			claim_component(iconchevrondownmedium.$$.fragment, button_nodes);
			button_nodes.forEach(detach_dev);
			t2 = claim_space(div1_nodes);
			claim_component(popover.$$.fragment, div1_nodes);
			t3 = claim_space(div1_nodes);
			div0 = claim_element(div1_nodes, "DIV", {});
			children(div0).forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(button, "class", "spectrum-FieldButton spectrum-Dropdown-trigger svelte-1uh8ujk");
			attr_dev(button, "aria-haspopup", "listbox");
			attr_dev(button, "id", "rubus-ActionSource");
			set_style(button, "min-width", /*minWidth*/ ctx[5] + "px");
			toggle_class(button, "is-selected", /*isOpen*/ ctx[0]);
			toggle_class(button, "is-invalid", /*isInvalid*/ ctx[3]);
			toggle_class(button, "is-disabled", /*disabled*/ ctx[2]);
			toggle_class(button, "spectrum-FieldButton--quiet", /*isQuiet*/ ctx[4]);
			add_location(button, file$a, 142, 2, 3933);
			add_location(div0, file$a, 169, 2, 4834);
			attr_dev(div1, "class", "spectrum-Dropdown");
			toggle_class(div1, "is-open", /*isOpen*/ ctx[0]);
			toggle_class(div1, "is-invalid", /*isInvalid*/ ctx[3]);
			toggle_class(div1, "is-disabled", /*disabled*/ ctx[2]);
			toggle_class(div1, "spectrum-Dropdown--quiet", /*isQuiet*/ ctx[4]);
			add_location(div1, file$a, 134, 0, 3694);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, button);
			if_blocks[current_block_type_index].m(button, null);
			append_dev(button, t0);
			if (if_block1) if_block1.m(button, null);
			append_dev(button, t1);
			mount_component(iconchevrondownmedium, button, null);
			append_dev(div1, t2);
			mount_component(popover, div1, null);
			append_dev(div1, t3);
			append_dev(div1, div0);
			/*div1_binding*/ ctx[14](div1);
			current = true;

			if (!mounted) {
				dispose = listen_dev(
					div1,
					"click",
					function () {
						if (is_function(!/*disabled*/ ctx[2] && /*dropdownStatusCutover*/ ctx[9])) (!/*disabled*/ ctx[2] && /*dropdownStatusCutover*/ ctx[9]).apply(this, arguments);
					},
					false,
					false,
					false
				);

				mounted = true;
			}
		},
		p: function update(new_ctx, [dirty]) {
			ctx = new_ctx;
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block0 = if_blocks[current_block_type_index];

				if (!if_block0) {
					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block0.c();
				}

				transition_in(if_block0, 1);
				if_block0.m(button, t0);
			}

			if (/*isInvalid*/ ctx[3]) {
				if (if_block1) {
					if (dirty & /*isInvalid*/ 8) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$7(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(button, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*minWidth*/ 32) {
				set_style(button, "min-width", /*minWidth*/ ctx[5] + "px");
			}

			if (dirty & /*isOpen*/ 1) {
				toggle_class(button, "is-selected", /*isOpen*/ ctx[0]);
			}

			if (dirty & /*isInvalid*/ 8) {
				toggle_class(button, "is-invalid", /*isInvalid*/ ctx[3]);
			}

			if (dirty & /*disabled*/ 4) {
				toggle_class(button, "is-disabled", /*disabled*/ ctx[2]);
			}

			if (dirty & /*isQuiet*/ 16) {
				toggle_class(button, "spectrum-FieldButton--quiet", /*isQuiet*/ ctx[4]);
			}

			const popover_changes = {};
			if (dirty & /*isOpen*/ 1) popover_changes.isOpen = /*isOpen*/ ctx[0];

			if (dirty & /*$$scope, minWidth*/ 32800) {
				popover_changes.$$scope = { dirty, ctx };
			}

			popover.$set(popover_changes);

			if (dirty & /*isOpen*/ 1) {
				toggle_class(div1, "is-open", /*isOpen*/ ctx[0]);
			}

			if (dirty & /*isInvalid*/ 8) {
				toggle_class(div1, "is-invalid", /*isInvalid*/ ctx[3]);
			}

			if (dirty & /*disabled*/ 4) {
				toggle_class(div1, "is-disabled", /*disabled*/ ctx[2]);
			}

			if (dirty & /*isQuiet*/ 16) {
				toggle_class(div1, "spectrum-Dropdown--quiet", /*isQuiet*/ ctx[4]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(iconchevrondownmedium.$$.fragment, local);
			transition_in(popover.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(iconchevrondownmedium.$$.fragment, local);
			transition_out(popover.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if_blocks[current_block_type_index].d();
			if (if_block1) if_block1.d();
			destroy_component(iconchevrondownmedium);
			destroy_component(popover);
			/*div1_binding*/ ctx[14](null);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$a.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function testHasClassName(el, verifyString) {
	if (!el) {
		return false;
	}

	for (let index = 0; index < el.length; index++) {
		return el[index] === verifyString;
	}
}

function getNodeHTML(el) {
	if (!el.length) {
		return "";
	}

	let nodeHTML = "";

	for (let index = 0; index < el.length; index++) {
		if (!testHasClassName(el[index].classList, `spectrum-Menu-checkmark`)) {
			el[index].outerHTML
			? nodeHTML = nodeHTML + el[index].outerHTML
			: nodeHTML;
		}
	}

	return nodeHTML.replace(/spectrum-Menu-itemLabel/g, "spectrum-Dropdown-label");
}

function instance$a($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Dropdown", slots, ['dropdown-label','default']);
	let { placeholder = "" } = $$props;
	let { disabled = false } = $$props;
	let { isOpen = false } = $$props;
	let { resultIndex = 0 } = $$props;
	let { thisIndex = 0 } = $$props;
	let { isInvalid = false } = $$props;
	let { isQuiet = false } = $$props;
	let { minWidth = 200 } = $$props;
	let { autoFold = true } = $$props;
	let isActive = false;

	function dropdownStatusCutover() {
		$$invalidate(6, isActive = true);
		$$invalidate(10, resultIndex = thisIndex);
		$$invalidate(0, isOpen = !isOpen);
	}

	onMount(() => {
		dropmenuEl && dropmenuEl.addEventListener("click", listenForChildClicks);
		dropmenuEl && dropmenuEl.addEventListener("keyup", listenForChildClicks);
		window && window.addEventListener("click", listenForOtherClicks);
		window && window.addEventListener("keyup", listenForOtherClicks);
	});

	let dropmenuEl;
	let triggerNode = "";

	function listenForChildClicks(e) {
		if (dropmenuEl && dropmenuEl.contains(e.target)) {
			if (e.target.classList.length) {
				if (testHasClassName(e.target.classList, `spectrum-Menu-item`)) {
					$$invalidate(8, triggerNode = getNodeHTML(e.target.childNodes));
				} else if (testHasClassName(e.target.classList, `spectrum-Menu-itemLabel`)) {
					$$invalidate(8, triggerNode = getNodeHTML(e.target.parentNode.childNodes));
				} else if (testHasClassName(e.target.parentNode.classList, `spectrum-Menu-item`)) {
					$$invalidate(8, triggerNode = getNodeHTML(e.target.parentNode.childNodes));
				}
			}
		}
	}

	function listenForOtherClicks(e) {
		if (!autoFold) {
			return;
		}

		if (dropmenuEl && !dropmenuEl.contains(e.target)) {
			$$invalidate(0, isOpen = false);
		}
	}

	const writable_props = [
		"placeholder",
		"disabled",
		"isOpen",
		"resultIndex",
		"thisIndex",
		"isInvalid",
		"isQuiet",
		"minWidth",
		"autoFold"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dropdown> was created with unknown prop '${key}'`);
	});

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			dropmenuEl = $$value;
			$$invalidate(7, dropmenuEl);
		});
	}

	$$self.$$set = $$props => {
		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
		if ("resultIndex" in $$props) $$invalidate(10, resultIndex = $$props.resultIndex);
		if ("thisIndex" in $$props) $$invalidate(11, thisIndex = $$props.thisIndex);
		if ("isInvalid" in $$props) $$invalidate(3, isInvalid = $$props.isInvalid);
		if ("isQuiet" in $$props) $$invalidate(4, isQuiet = $$props.isQuiet);
		if ("minWidth" in $$props) $$invalidate(5, minWidth = $$props.minWidth);
		if ("autoFold" in $$props) $$invalidate(12, autoFold = $$props.autoFold);
		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		onMount,
		IconChevronDownMedium: ChevronDownMedium,
		IconAlertMedium: AlertMedium,
		Popover,
		Menu,
		placeholder,
		disabled,
		isOpen,
		resultIndex,
		thisIndex,
		isInvalid,
		isQuiet,
		minWidth,
		autoFold,
		isActive,
		dropdownStatusCutover,
		dropmenuEl,
		triggerNode,
		listenForChildClicks,
		listenForOtherClicks,
		testHasClassName,
		getNodeHTML
	});

	$$self.$inject_state = $$props => {
		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
		if ("resultIndex" in $$props) $$invalidate(10, resultIndex = $$props.resultIndex);
		if ("thisIndex" in $$props) $$invalidate(11, thisIndex = $$props.thisIndex);
		if ("isInvalid" in $$props) $$invalidate(3, isInvalid = $$props.isInvalid);
		if ("isQuiet" in $$props) $$invalidate(4, isQuiet = $$props.isQuiet);
		if ("minWidth" in $$props) $$invalidate(5, minWidth = $$props.minWidth);
		if ("autoFold" in $$props) $$invalidate(12, autoFold = $$props.autoFold);
		if ("isActive" in $$props) $$invalidate(6, isActive = $$props.isActive);
		if ("dropmenuEl" in $$props) $$invalidate(7, dropmenuEl = $$props.dropmenuEl);
		if ("triggerNode" in $$props) $$invalidate(8, triggerNode = $$props.triggerNode);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		isOpen,
		placeholder,
		disabled,
		isInvalid,
		isQuiet,
		minWidth,
		isActive,
		dropmenuEl,
		triggerNode,
		dropdownStatusCutover,
		resultIndex,
		thisIndex,
		autoFold,
		slots,
		div1_binding,
		$$scope
	];
}

class Dropdown extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
			placeholder: 1,
			disabled: 2,
			isOpen: 0,
			resultIndex: 10,
			thisIndex: 11,
			isInvalid: 3,
			isQuiet: 4,
			minWidth: 5,
			autoFold: 12
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Dropdown",
			options,
			id: create_fragment$a.name
		});
	}

	get placeholder() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get disabled() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isOpen() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isOpen(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get resultIndex() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set resultIndex(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get thisIndex() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set thisIndex(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isInvalid() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isInvalid(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isQuiet() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isQuiet(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get minWidth() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set minWidth(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get autoFold() {
		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set autoFold(value) {
		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var zh = [
	{
		url: "./",
		name: "首页"
	},
	{
		url: "./docs",
		name: "文档"
	},
	{
		url: "./resources",
		name: "资源"
	}
];
var en = [
	{
		url: "./",
		name: "Home"
	},
	{
		url: "./docs",
		name: "Docs"
	},
	{
		url: "./resources",
		name: "Resources"
	}
];
var nav = {
	zh: zh,
	en: en
};

var router = /*#__PURE__*/Object.freeze({
    __proto__: null,
    zh: zh,
    en: en,
    'default': nav
});

/* src/components/nav/Nav.svelte generated by Svelte v3.29.4 */
const file$b = "src/components/nav/Nav.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i];
	child_ctx[13] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i];
	child_ctx[16] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	child_ctx[13] = i;
	return child_ctx;
}

// (152:14) {#if route.url.replace('./', '') === segment || (route.url === './' && !segment && i == 0)}
function create_if_block$8(ctx) {
	let span;

	const block = {
		c: function create() {
			span = element("span");
			this.h();
		},
		l: function claim(nodes) {
			span = claim_element(nodes, "SPAN", { class: true });
			children(span).forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(span, "class", "svelte-kd8wpn");
			add_location(span, file$b, 152, 16, 3549);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$8.name,
		type: "if",
		source: "(152:14) {#if route.url.replace('./', '') === segment || (route.url === './' && !segment && i == 0)}",
		ctx
	});

	return block;
}

// (147:8) {#each router[$rubusDocConfig.lang] as route, i}
function create_each_block_2(ctx) {
	let li;
	let a;
	let t0_value = /*route*/ ctx[17].name + "";
	let t0;
	let t1;
	let show_if = /*route*/ ctx[17].url.replace("./", "") === /*segment*/ ctx[0] || /*route*/ ctx[17].url === "./" && !/*segment*/ ctx[0] && /*i*/ ctx[13] == 0;
	let a_href_value;
	let t2;
	let if_block = show_if && create_if_block$8(ctx);

	const block = {
		c: function create() {
			li = element("li");
			a = element("a");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			this.h();
		},
		l: function claim(nodes) {
			li = claim_element(nodes, "LI", { class: true });
			var li_nodes = children(li);
			a = claim_element(li_nodes, "A", { href: true, class: true });
			var a_nodes = children(a);
			t0 = claim_text(a_nodes, t0_value);
			t1 = claim_space(a_nodes);
			if (if_block) if_block.l(a_nodes);
			a_nodes.forEach(detach_dev);
			t2 = claim_space(li_nodes);
			li_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(a, "href", a_href_value = /*route*/ ctx[17].url);
			attr_dev(a, "class", "svelte-kd8wpn");
			add_location(a, file$b, 150, 12, 3394);
			attr_dev(li, "class", "route-item svelte-kd8wpn");
			toggle_class(li, "current-route", /*route*/ ctx[17].url.replace("./", "") === /*segment*/ ctx[0] || /*route*/ ctx[17].url === "./" && !/*segment*/ ctx[0] && /*i*/ ctx[13] == 0);
			add_location(li, file$b, 147, 10, 3226);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, a);
			append_dev(a, t0);
			append_dev(a, t1);
			if (if_block) if_block.m(a, null);
			append_dev(li, t2);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*$rubusDocConfig*/ 8 && t0_value !== (t0_value = /*route*/ ctx[17].name + "")) set_data_dev(t0, t0_value);
			if (dirty & /*$rubusDocConfig, segment*/ 9) show_if = /*route*/ ctx[17].url.replace("./", "") === /*segment*/ ctx[0] || /*route*/ ctx[17].url === "./" && !/*segment*/ ctx[0] && /*i*/ ctx[13] == 0;

			if (show_if) {
				if (if_block) ; else {
					if_block = create_if_block$8(ctx);
					if_block.c();
					if_block.m(a, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*$rubusDocConfig*/ 8 && a_href_value !== (a_href_value = /*route*/ ctx[17].url)) {
				attr_dev(a, "href", a_href_value);
			}

			if (dirty & /*router, $rubusDocConfig, segment*/ 9) {
				toggle_class(li, "current-route", /*route*/ ctx[17].url.replace("./", "") === /*segment*/ ctx[0] || /*route*/ ctx[17].url === "./" && !/*segment*/ ctx[0] && /*i*/ ctx[13] == 0);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
			if (if_block) if_block.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_2.name,
		type: "each",
		source: "(147:8) {#each router[$rubusDocConfig.lang] as route, i}",
		ctx
	});

	return block;
}

// (166:10) {#each themeList as item, index}
function create_each_block_1(ctx) {
	let menuitem;
	let current;

	function click_handler(...args) {
		return /*click_handler*/ ctx[9](/*item*/ ctx[14], ...args);
	}

	menuitem = new MenuItem({
			props: {
				thisIndex: /*index*/ ctx[16],
				label: /*item*/ ctx[14].replace(/^\S/, func),
				resultIndex: /*resultThemeIndex*/ ctx[2]
			},
			$$inline: true
		});

	menuitem.$on("click", click_handler);

	const block = {
		c: function create() {
			create_component(menuitem.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(menuitem.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(menuitem, target, anchor);
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const menuitem_changes = {};
			if (dirty & /*resultThemeIndex*/ 4) menuitem_changes.resultIndex = /*resultThemeIndex*/ ctx[2];
			menuitem.$set(menuitem_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(menuitem.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(menuitem.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(menuitem, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(166:10) {#each themeList as item, index}",
		ctx
	});

	return block;
}

// (161:8) <Dropdown           placeholder={$rubusDocConfig.theme.replace(/^\S/, (s) => s.toUpperCase())}           isQuiet           minWidth="80"           resultIndex={resultThemeIndex}>
function create_default_slot_1$1(ctx) {
	let each_1_anchor;
	let current;
	let each_value_1 = /*themeList*/ ctx[5];
	validate_each_argument(each_value_1);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		l: function claim(nodes) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(nodes);
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (dirty & /*themeList, resultThemeIndex, switchTheme*/ 164) {
				each_value_1 = /*themeList*/ ctx[5];
				validate_each_argument(each_value_1);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$1.name,
		type: "slot",
		source: "(161:8) <Dropdown           placeholder={$rubusDocConfig.theme.replace(/^\\S/, (s) => s.toUpperCase())}           isQuiet           minWidth=\\\"80\\\"           resultIndex={resultThemeIndex}>",
		ctx
	});

	return block;
}

// (179:10) {#each languageList as lang, i}
function create_each_block(ctx) {
	let menuitem;
	let current;

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[10](/*lang*/ ctx[11], ...args);
	}

	menuitem = new MenuItem({
			props: {
				thisIndex: /*i*/ ctx[13],
				label: /*lang*/ ctx[11].name,
				resultIndex: /*resultLanguageIndex*/ ctx[1],
				isSelected: /*i*/ ctx[13] === /*resultLanguageIndex*/ ctx[1]
			},
			$$inline: true
		});

	menuitem.$on("click", click_handler_1);

	const block = {
		c: function create() {
			create_component(menuitem.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(menuitem.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(menuitem, target, anchor);
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const menuitem_changes = {};
			if (dirty & /*resultLanguageIndex*/ 2) menuitem_changes.resultIndex = /*resultLanguageIndex*/ ctx[1];
			if (dirty & /*resultLanguageIndex*/ 2) menuitem_changes.isSelected = /*i*/ ctx[13] === /*resultLanguageIndex*/ ctx[1];
			menuitem.$set(menuitem_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(menuitem.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(menuitem.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(menuitem, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(179:10) {#each languageList as lang, i}",
		ctx
	});

	return block;
}

// (178:8) <Dropdown placeholder="Language" isQuiet minWidth="80" resultIndex={resultLanguageIndex}>
function create_default_slot$1(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*languageList*/ ctx[6];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		l: function claim(nodes) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(nodes);
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (dirty & /*languageList, resultLanguageIndex, switchLanguage*/ 322) {
				each_value = /*languageList*/ ctx[6];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$1.name,
		type: "slot",
		source: "(178:8) <Dropdown placeholder=\\\"Language\\\" isQuiet minWidth=\\\"80\\\" resultIndex={resultLanguageIndex}>",
		ctx
	});

	return block;
}

function create_fragment$b(ctx) {
	let nav;
	let ul1;
	let li0;
	let a;
	let img;
	let img_src_value;
	let t0;
	let li1;
	let ul0;
	let t1;
	let li2;
	let div0;
	let dropdown0;
	let t2;
	let div1;
	let dropdown1;
	let current;
	let each_value_2 = router[/*$rubusDocConfig*/ ctx[3].lang];
	validate_each_argument(each_value_2);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	dropdown0 = new Dropdown({
			props: {
				placeholder: /*$rubusDocConfig*/ ctx[3].theme.replace(/^\S/, func_1),
				isQuiet: true,
				minWidth: "80",
				resultIndex: /*resultThemeIndex*/ ctx[2],
				$$slots: { default: [create_default_slot_1$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	dropdown1 = new Dropdown({
			props: {
				placeholder: "Language",
				isQuiet: true,
				minWidth: "80",
				resultIndex: /*resultLanguageIndex*/ ctx[1],
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			nav = element("nav");
			ul1 = element("ul");
			li0 = element("li");
			a = element("a");
			img = element("img");
			t0 = space();
			li1 = element("li");
			ul0 = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			li2 = element("li");
			div0 = element("div");
			create_component(dropdown0.$$.fragment);
			t2 = space();
			div1 = element("div");
			create_component(dropdown1.$$.fragment);
			this.h();
		},
		l: function claim(nodes) {
			nav = claim_element(nodes, "NAV", { class: true });
			var nav_nodes = children(nav);
			ul1 = claim_element(nav_nodes, "UL", { class: true });
			var ul1_nodes = children(ul1);
			li0 = claim_element(ul1_nodes, "LI", { class: true });
			var li0_nodes = children(li0);
			a = claim_element(li0_nodes, "A", { href: true, class: true });
			var a_nodes = children(a);
			img = claim_element(a_nodes, "IMG", { src: true, alt: true, class: true });
			a_nodes.forEach(detach_dev);
			li0_nodes.forEach(detach_dev);
			t0 = claim_space(ul1_nodes);
			li1 = claim_element(ul1_nodes, "LI", { class: true });
			var li1_nodes = children(li1);
			ul0 = claim_element(li1_nodes, "UL", { class: true });
			var ul0_nodes = children(ul0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(ul0_nodes);
			}

			ul0_nodes.forEach(detach_dev);
			li1_nodes.forEach(detach_dev);
			t1 = claim_space(ul1_nodes);
			li2 = claim_element(ul1_nodes, "LI", { class: true });
			var li2_nodes = children(li2);
			div0 = claim_element(li2_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			claim_component(dropdown0.$$.fragment, div0_nodes);
			div0_nodes.forEach(detach_dev);
			t2 = claim_space(li2_nodes);
			div1 = claim_element(li2_nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			claim_component(dropdown1.$$.fragment, div1_nodes);
			div1_nodes.forEach(detach_dev);
			li2_nodes.forEach(detach_dev);
			ul1_nodes.forEach(detach_dev);
			nav_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			if (img.src !== (img_src_value = "logo-" + (/*$rubusDocConfig*/ ctx[3].theme == "light" || /*$rubusDocConfig*/ ctx[3].theme == "lightest"
			? "light"
			: "dark") + ".png")) attr_dev(img, "src", img_src_value);

			attr_dev(img, "alt", "logo");
			attr_dev(img, "class", "svelte-kd8wpn");
			add_location(img, file$b, 139, 8, 2934);
			attr_dev(a, "href", "./");
			attr_dev(a, "class", "svelte-kd8wpn");
			add_location(a, file$b, 138, 6, 2912);
			attr_dev(li0, "class", "nav-item nav-logo svelte-kd8wpn");
			add_location(li0, file$b, 137, 4, 2875);
			attr_dev(ul0, "class", "router-wrap svelte-kd8wpn");
			add_location(ul0, file$b, 145, 6, 3134);
			attr_dev(li1, "class", "nav-item svelte-kd8wpn");
			add_location(li1, file$b, 144, 4, 3106);
			attr_dev(div0, "class", "theme-list svelte-kd8wpn");
			add_location(div0, file$b, 159, 6, 3682);
			attr_dev(div1, "class", "language-list svelte-kd8wpn");
			add_location(div1, file$b, 176, 6, 4246);
			attr_dev(li2, "class", "nav-item nav-menu-area svelte-kd8wpn");
			add_location(li2, file$b, 158, 4, 3640);
			attr_dev(ul1, "class", "nav-wrap svelte-kd8wpn");
			add_location(ul1, file$b, 136, 2, 2849);
			attr_dev(nav, "class", "svelte-kd8wpn");
			add_location(nav, file$b, 135, 0, 2841);
		},
		m: function mount(target, anchor) {
			insert_dev(target, nav, anchor);
			append_dev(nav, ul1);
			append_dev(ul1, li0);
			append_dev(li0, a);
			append_dev(a, img);
			append_dev(ul1, t0);
			append_dev(ul1, li1);
			append_dev(li1, ul0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul0, null);
			}

			append_dev(ul1, t1);
			append_dev(ul1, li2);
			append_dev(li2, div0);
			mount_component(dropdown0, div0, null);
			append_dev(li2, t2);
			append_dev(li2, div1);
			mount_component(dropdown1, div1, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*$rubusDocConfig*/ 8 && img.src !== (img_src_value = "logo-" + (/*$rubusDocConfig*/ ctx[3].theme == "light" || /*$rubusDocConfig*/ ctx[3].theme == "lightest"
			? "light"
			: "dark") + ".png")) {
				attr_dev(img, "src", img_src_value);
			}

			if (dirty & /*router, $rubusDocConfig, segment*/ 9) {
				each_value_2 = router[/*$rubusDocConfig*/ ctx[3].lang];
				validate_each_argument(each_value_2);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(ul0, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}

			const dropdown0_changes = {};
			if (dirty & /*$rubusDocConfig*/ 8) dropdown0_changes.placeholder = /*$rubusDocConfig*/ ctx[3].theme.replace(/^\S/, func_1);
			if (dirty & /*resultThemeIndex*/ 4) dropdown0_changes.resultIndex = /*resultThemeIndex*/ ctx[2];

			if (dirty & /*$$scope, resultThemeIndex*/ 524292) {
				dropdown0_changes.$$scope = { dirty, ctx };
			}

			dropdown0.$set(dropdown0_changes);
			const dropdown1_changes = {};
			if (dirty & /*resultLanguageIndex*/ 2) dropdown1_changes.resultIndex = /*resultLanguageIndex*/ ctx[1];

			if (dirty & /*$$scope, resultLanguageIndex*/ 524290) {
				dropdown1_changes.$$scope = { dirty, ctx };
			}

			dropdown1.$set(dropdown1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(dropdown0.$$.fragment, local);
			transition_in(dropdown1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(dropdown0.$$.fragment, local);
			transition_out(dropdown1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(nav);
			destroy_each(each_blocks, detaching);
			destroy_component(dropdown0);
			destroy_component(dropdown1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$b.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const func = s => s.toUpperCase();
const func_1 = s => s.toUpperCase();

function instance$b($$self, $$props, $$invalidate) {
	let $rubusDocConfig;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Nav", slots, []);
	let { segment = "" } = $$props;
	let rubusDocConfig = getContext("rubusDocConfig");
	validate_store(rubusDocConfig, "rubusDocConfig");
	component_subscribe($$self, rubusDocConfig, value => $$invalidate(3, $rubusDocConfig = value));
	let themeList = ["light", "lightest", "dark", "darkest"];
	let languageList = [{ name: "中文", code: "zh" }, { name: "English", code: "en" }];
	let resultLanguageIndex = 0;
	let resultThemeIndex = 0;

	function switchTheme(t) {
		set_store_value(rubusDocConfig, $rubusDocConfig.theme = t, $rubusDocConfig);
		window.localStorage.setItem("rubus-local-config-theme", t);
	}

	function switchLanguage(l) {
		set_store_value(rubusDocConfig, $rubusDocConfig.lang = l, $rubusDocConfig);
		window.localStorage.setItem("rubus-local-config-lang", l);
	}

	beforeUpdate(() => {
		for (let index = 0; index < themeList.length; index++) {
			if (themeList[index] === $rubusDocConfig.theme) {
				$$invalidate(2, resultThemeIndex = index);
			}
		}

		for (let index = 0; index < languageList.length; index++) {
			if (languageList[index].code === $rubusDocConfig.lang) {
				$$invalidate(1, resultLanguageIndex = index);
			}
		}
	});

	const writable_props = ["segment"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
	});

	const click_handler = item => {
		switchTheme(item);
	};

	const click_handler_1 = lang => {
		switchLanguage(lang.code);
	};

	$$self.$$set = $$props => {
		if ("segment" in $$props) $$invalidate(0, segment = $$props.segment);
	};

	$$self.$capture_state = () => ({
		router,
		Button,
		ActionGroup,
		Dropdown,
		MenuItem,
		afterUpdate,
		beforeUpdate,
		getContext,
		onMount,
		segment,
		rubusDocConfig,
		themeList,
		languageList,
		resultLanguageIndex,
		resultThemeIndex,
		switchTheme,
		switchLanguage,
		$rubusDocConfig
	});

	$$self.$inject_state = $$props => {
		if ("segment" in $$props) $$invalidate(0, segment = $$props.segment);
		if ("rubusDocConfig" in $$props) $$invalidate(4, rubusDocConfig = $$props.rubusDocConfig);
		if ("themeList" in $$props) $$invalidate(5, themeList = $$props.themeList);
		if ("languageList" in $$props) $$invalidate(6, languageList = $$props.languageList);
		if ("resultLanguageIndex" in $$props) $$invalidate(1, resultLanguageIndex = $$props.resultLanguageIndex);
		if ("resultThemeIndex" in $$props) $$invalidate(2, resultThemeIndex = $$props.resultThemeIndex);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		segment,
		resultLanguageIndex,
		resultThemeIndex,
		$rubusDocConfig,
		rubusDocConfig,
		themeList,
		languageList,
		switchTheme,
		switchLanguage,
		click_handler,
		click_handler_1
	];
}

class Nav extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$b, create_fragment$b, safe_not_equal, { segment: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Nav",
			options,
			id: create_fragment$b.name
		});
	}

	get segment() {
		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set segment(value) {
		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/routes/_layout.svelte generated by Svelte v3.29.4 */
const file$c = "src/routes/_layout.svelte";

// (40:0) <Cornerstone spectrumTheme={$_rubusDocConfig.theme}>
function create_default_slot$2(ctx) {
	let nav;
	let t;
	let main;
	let current;

	nav = new Nav({
			props: { segment: /*segment*/ ctx[0] },
			$$inline: true
		});

	const default_slot_template = /*#slots*/ ctx[3].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	const block = {
		c: function create() {
			create_component(nav.$$.fragment);
			t = space();
			main = element("main");
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			claim_component(nav.$$.fragment, nodes);
			t = claim_space(nodes);
			main = claim_element(nodes, "MAIN", { class: true });
			var main_nodes = children(main);
			if (default_slot) default_slot.l(main_nodes);
			main_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(main, "class", "svelte-12c7nxz");
			add_location(main, file$c, 41, 2, 1208);
		},
		m: function mount(target, anchor) {
			mount_component(nav, target, anchor);
			insert_dev(target, t, anchor);
			insert_dev(target, main, anchor);

			if (default_slot) {
				default_slot.m(main, null);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			const nav_changes = {};
			if (dirty & /*segment*/ 1) nav_changes.segment = /*segment*/ ctx[0];
			nav.$set(nav_changes);

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 16) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(nav.$$.fragment, local);
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(nav.$$.fragment, local);
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(nav, detaching);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(main);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$2.name,
		type: "slot",
		source: "(40:0) <Cornerstone spectrumTheme={$_rubusDocConfig.theme}>",
		ctx
	});

	return block;
}

function create_fragment$c(ctx) {
	let cornerstone;
	let current;

	cornerstone = new Cornerstone({
			props: {
				spectrumTheme: /*$_rubusDocConfig*/ ctx[1].theme,
				$$slots: { default: [create_default_slot$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(cornerstone.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(cornerstone.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(cornerstone, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const cornerstone_changes = {};
			if (dirty & /*$_rubusDocConfig*/ 2) cornerstone_changes.spectrumTheme = /*$_rubusDocConfig*/ ctx[1].theme;

			if (dirty & /*$$scope, segment*/ 17) {
				cornerstone_changes.$$scope = { dirty, ctx };
			}

			cornerstone.$set(cornerstone_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(cornerstone.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(cornerstone.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(cornerstone, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$c.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$c($$self, $$props, $$invalidate) {
	let $_rubusDocConfig;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Layout", slots, ['default']);
	let { segment } = $$props;
	const rubusDocConfig = writable({ lang: "zh", theme: "light" });
	setContext("rubusDocConfig", rubusDocConfig);
	let _rubusDocConfig = getContext("rubusDocConfig");
	validate_store(_rubusDocConfig, "_rubusDocConfig");
	component_subscribe($$self, _rubusDocConfig, value => $$invalidate(1, $_rubusDocConfig = value));

	onMount(() => {
		if (window.localStorage.getItem("rubus-local-config-theme")) {
			set_store_value(_rubusDocConfig, $_rubusDocConfig.theme = window.localStorage.getItem("rubus-local-config-theme"), $_rubusDocConfig);
		} else {
			window.localStorage.setItem("rubus-local-config-theme", $_rubusDocConfig.theme);
		}

		if (window.localStorage.getItem("rubus-local-config-lang")) {
			set_store_value(_rubusDocConfig, $_rubusDocConfig.lang = window.localStorage.getItem("rubus-local-config-lang"), $_rubusDocConfig);
		} else {
			window.localStorage.setItem("rubus-local-config-lang", $_rubusDocConfig.lang);
		}
	});

	const writable_props = ["segment"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("segment" in $$props) $$invalidate(0, segment = $$props.segment);
		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		Cornerstone,
		setContext,
		getContext,
		onMount,
		writable,
		Nav,
		segment,
		rubusDocConfig,
		_rubusDocConfig,
		$_rubusDocConfig
	});

	$$self.$inject_state = $$props => {
		if ("segment" in $$props) $$invalidate(0, segment = $$props.segment);
		if ("_rubusDocConfig" in $$props) $$invalidate(2, _rubusDocConfig = $$props._rubusDocConfig);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [segment, $_rubusDocConfig, _rubusDocConfig, slots, $$scope];
}

class Layout extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$c, create_fragment$c, safe_not_equal, { segment: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Layout",
			options,
			id: create_fragment$c.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*segment*/ ctx[0] === undefined && !("segment" in props)) {
			console.warn("<Layout> was created without expected prop 'segment'");
		}
	}

	get segment() {
		throw new Error("<Layout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set segment(value) {
		throw new Error("<Layout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var root_comp = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Layout
});

/* src/routes/_error.svelte generated by Svelte v3.29.4 */

const { Error: Error_1 } = globals;
const file$d = "src/routes/_error.svelte";

// (38:0) {#if dev && error.stack}
function create_if_block$9(ctx) {
	let pre;
	let t_value = /*error*/ ctx[1].stack + "";
	let t;

	const block = {
		c: function create() {
			pre = element("pre");
			t = text(t_value);
			this.h();
		},
		l: function claim(nodes) {
			pre = claim_element(nodes, "PRE", {});
			var pre_nodes = children(pre);
			t = claim_text(pre_nodes, t_value);
			pre_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			add_location(pre, file$d, 38, 1, 443);
		},
		m: function mount(target, anchor) {
			insert_dev(target, pre, anchor);
			append_dev(pre, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*error*/ 2 && t_value !== (t_value = /*error*/ ctx[1].stack + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(pre);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$9.name,
		type: "if",
		source: "(38:0) {#if dev && error.stack}",
		ctx
	});

	return block;
}

function create_fragment$d(ctx) {
	let title_value;
	let t0;
	let h1;
	let t1;
	let t2;
	let p;
	let t3_value = /*error*/ ctx[1].message + "";
	let t3;
	let t4;
	let if_block_anchor;
	document.title = title_value = /*status*/ ctx[0];
	let if_block = /*dev*/ ctx[2] && /*error*/ ctx[1].stack && create_if_block$9(ctx);

	const block = {
		c: function create() {
			t0 = space();
			h1 = element("h1");
			t1 = text(/*status*/ ctx[0]);
			t2 = space();
			p = element("p");
			t3 = text(t3_value);
			t4 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.h();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all("[data-svelte=\"svelte-1o9r2ue\"]", document.head);
			head_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			h1 = claim_element(nodes, "H1", { class: true });
			var h1_nodes = children(h1);
			t1 = claim_text(h1_nodes, /*status*/ ctx[0]);
			h1_nodes.forEach(detach_dev);
			t2 = claim_space(nodes);
			p = claim_element(nodes, "P", { class: true });
			var p_nodes = children(p);
			t3 = claim_text(p_nodes, t3_value);
			p_nodes.forEach(detach_dev);
			t4 = claim_space(nodes);
			if (if_block) if_block.l(nodes);
			if_block_anchor = empty();
			this.h();
		},
		h: function hydrate() {
			attr_dev(h1, "class", "svelte-8od9u6");
			add_location(h1, file$d, 33, 0, 374);
			attr_dev(p, "class", "svelte-8od9u6");
			add_location(p, file$d, 35, 0, 393);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, h1, anchor);
			append_dev(h1, t1);
			insert_dev(target, t2, anchor);
			insert_dev(target, p, anchor);
			append_dev(p, t3);
			insert_dev(target, t4, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*status*/ 1 && title_value !== (title_value = /*status*/ ctx[0])) {
				document.title = title_value;
			}

			if (dirty & /*status*/ 1) set_data_dev(t1, /*status*/ ctx[0]);
			if (dirty & /*error*/ 2 && t3_value !== (t3_value = /*error*/ ctx[1].message + "")) set_data_dev(t3, t3_value);

			if (/*dev*/ ctx[2] && /*error*/ ctx[1].stack) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$9(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(h1);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(p);
			if (detaching) detach_dev(t4);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$d.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$d($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Error", slots, []);
	let { status } = $$props;
	let { error } = $$props;
	const dev = "development" === "development";
	const writable_props = ["status", "error"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Error> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("status" in $$props) $$invalidate(0, status = $$props.status);
		if ("error" in $$props) $$invalidate(1, error = $$props.error);
	};

	$$self.$capture_state = () => ({ status, error, dev });

	$$self.$inject_state = $$props => {
		if ("status" in $$props) $$invalidate(0, status = $$props.status);
		if ("error" in $$props) $$invalidate(1, error = $$props.error);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [status, error, dev];
}

class Error$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$d, create_fragment$d, safe_not_equal, { status: 0, error: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Error",
			options,
			id: create_fragment$d.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*status*/ ctx[0] === undefined && !("status" in props)) {
			console.warn("<Error> was created without expected prop 'status'");
		}

		if (/*error*/ ctx[1] === undefined && !("error" in props)) {
			console.warn("<Error> was created without expected prop 'error'");
		}
	}

	get status() {
		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set status(value) {
		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get error() {
		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set error(value) {
		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.29.4 */

const { Error: Error_1$1 } = globals;

// (24:1) {:else}
function create_else_block$3(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [{ segment: /*segments*/ ctx[2][1] }, /*level1*/ ctx[4].props];
	var switch_value = /*level1*/ ctx[4].component;

	function switch_props(ctx) {
		let switch_instance_props = {
			$$slots: { default: [create_default_slot_1$2] },
			$$scope: { ctx }
		};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		l: function claim(nodes) {
			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty & /*segments, level1*/ 20)
			? get_spread_update(switch_instance_spread_levels, [
					dirty & /*segments*/ 4 && { segment: /*segments*/ ctx[2][1] },
					dirty & /*level1*/ 16 && get_spread_object(/*level1*/ ctx[4].props)
				])
			: {};

			if (dirty & /*$$scope, level2*/ 288) {
				switch_instance_changes.$$scope = { dirty, ctx };
			}

			if (switch_value !== (switch_value = /*level1*/ ctx[4].component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$3.name,
		type: "else",
		source: "(24:1) {:else}",
		ctx
	});

	return block;
}

// (22:1) {#if error}
function create_if_block$a(ctx) {
	let error_1;
	let current;

	error_1 = new Error$1({
			props: {
				error: /*error*/ ctx[0],
				status: /*status*/ ctx[1]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(error_1.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(error_1.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(error_1, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const error_1_changes = {};
			if (dirty & /*error*/ 1) error_1_changes.error = /*error*/ ctx[0];
			if (dirty & /*status*/ 2) error_1_changes.status = /*status*/ ctx[1];
			error_1.$set(error_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(error_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(error_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(error_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$a.name,
		type: "if",
		source: "(22:1) {#if error}",
		ctx
	});

	return block;
}

// (26:3) {#if level2}
function create_if_block_1$8(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*level2*/ ctx[5].props];
	var switch_value = /*level2*/ ctx[5].component;

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		l: function claim(nodes) {
			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty & /*level2*/ 32)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*level2*/ ctx[5].props)])
			: {};

			if (switch_value !== (switch_value = /*level2*/ ctx[5].component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$8.name,
		type: "if",
		source: "(26:3) {#if level2}",
		ctx
	});

	return block;
}

// (25:2) <svelte:component this="{level1.component}" segment="{segments[1]}" {...level1.props}>
function create_default_slot_1$2(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*level2*/ ctx[5] && create_if_block_1$8(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			if (if_block) if_block.l(nodes);
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*level2*/ ctx[5]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*level2*/ 32) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1$8(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$2.name,
		type: "slot",
		source: "(25:2) <svelte:component this=\\\"{level1.component}\\\" segment=\\\"{segments[1]}\\\" {...level1.props}>",
		ctx
	});

	return block;
}

// (21:0) <Layout segment="{segments[0]}" {...level0.props}>
function create_default_slot$3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$a, create_else_block$3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*error*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			if_block.l(nodes);
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$3.name,
		type: "slot",
		source: "(21:0) <Layout segment=\\\"{segments[0]}\\\" {...level0.props}>",
		ctx
	});

	return block;
}

function create_fragment$e(ctx) {
	let layout;
	let current;
	const layout_spread_levels = [{ segment: /*segments*/ ctx[2][0] }, /*level0*/ ctx[3].props];

	let layout_props = {
		$$slots: { default: [create_default_slot$3] },
		$$scope: { ctx }
	};

	for (let i = 0; i < layout_spread_levels.length; i += 1) {
		layout_props = assign(layout_props, layout_spread_levels[i]);
	}

	layout = new Layout({ props: layout_props, $$inline: true });

	const block = {
		c: function create() {
			create_component(layout.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(layout.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(layout, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const layout_changes = (dirty & /*segments, level0*/ 12)
			? get_spread_update(layout_spread_levels, [
					dirty & /*segments*/ 4 && { segment: /*segments*/ ctx[2][0] },
					dirty & /*level0*/ 8 && get_spread_object(/*level0*/ ctx[3].props)
				])
			: {};

			if (dirty & /*$$scope, error, status, level1, segments, level2*/ 311) {
				layout_changes.$$scope = { dirty, ctx };
			}

			layout.$set(layout_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(layout.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(layout.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(layout, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$e.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$e($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("App", slots, []);
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	let { level2 = null } = $$props;
	let { notify } = $$props;
	afterUpdate(notify);
	setContext(CONTEXT_KEY, stores);

	const writable_props = [
		"stores",
		"error",
		"status",
		"segments",
		"level0",
		"level1",
		"level2",
		"notify"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("stores" in $$props) $$invalidate(6, stores = $$props.stores);
		if ("error" in $$props) $$invalidate(0, error = $$props.error);
		if ("status" in $$props) $$invalidate(1, status = $$props.status);
		if ("segments" in $$props) $$invalidate(2, segments = $$props.segments);
		if ("level0" in $$props) $$invalidate(3, level0 = $$props.level0);
		if ("level1" in $$props) $$invalidate(4, level1 = $$props.level1);
		if ("level2" in $$props) $$invalidate(5, level2 = $$props.level2);
		if ("notify" in $$props) $$invalidate(7, notify = $$props.notify);
	};

	$$self.$capture_state = () => ({
		setContext,
		afterUpdate,
		CONTEXT_KEY,
		Layout,
		Error: Error$1,
		stores,
		error,
		status,
		segments,
		level0,
		level1,
		level2,
		notify
	});

	$$self.$inject_state = $$props => {
		if ("stores" in $$props) $$invalidate(6, stores = $$props.stores);
		if ("error" in $$props) $$invalidate(0, error = $$props.error);
		if ("status" in $$props) $$invalidate(1, status = $$props.status);
		if ("segments" in $$props) $$invalidate(2, segments = $$props.segments);
		if ("level0" in $$props) $$invalidate(3, level0 = $$props.level0);
		if ("level1" in $$props) $$invalidate(4, level1 = $$props.level1);
		if ("level2" in $$props) $$invalidate(5, level2 = $$props.level2);
		if ("notify" in $$props) $$invalidate(7, notify = $$props.notify);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [error, status, segments, level0, level1, level2, stores, notify];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
			stores: 6,
			error: 0,
			status: 1,
			segments: 2,
			level0: 3,
			level1: 4,
			level2: 5,
			notify: 7
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$e.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*stores*/ ctx[6] === undefined && !("stores" in props)) {
			console.warn("<App> was created without expected prop 'stores'");
		}

		if (/*error*/ ctx[0] === undefined && !("error" in props)) {
			console.warn("<App> was created without expected prop 'error'");
		}

		if (/*status*/ ctx[1] === undefined && !("status" in props)) {
			console.warn("<App> was created without expected prop 'status'");
		}

		if (/*segments*/ ctx[2] === undefined && !("segments" in props)) {
			console.warn("<App> was created without expected prop 'segments'");
		}

		if (/*level0*/ ctx[3] === undefined && !("level0" in props)) {
			console.warn("<App> was created without expected prop 'level0'");
		}

		if (/*notify*/ ctx[7] === undefined && !("notify" in props)) {
			console.warn("<App> was created without expected prop 'notify'");
		}
	}

	get stores() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stores(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get error() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set error(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get status() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set status(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get segments() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set segments(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get level0() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set level0(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get level1() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set level1(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get level2() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set level2(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get notify() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set notify(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

// This file is generated by Sapper — do not edit it!

const ignore = [];

const components = [
	{
		js: () => Promise.all([import('./index.113e2bdf.js'), __inject_styles(["client-bb50ff0b.css"])]).then(function(x) { return x[0]; })
	},
	{
		js: () => Promise.all([import('./_layout.f4166b26.js'), __inject_styles(["client-bb50ff0b.css","_layout-21e613b6.css"])]).then(function(x) { return x[0]; })
	},
	{
		js: () => Promise.all([import('./index.d0529cdd.js'), __inject_styles(["client-bb50ff0b.css"])]).then(function(x) { return x[0]; })
	},
	{
		js: () => Promise.all([import('./index.359226c9.js'), __inject_styles(["client-bb50ff0b.css"])]).then(function(x) { return x[0]; })
	}
];

const routes = [
	{
		// index.svelte
		pattern: /^\/$/,
		parts: [
			{ i: 0 }
		]
	},

	{
		// docs/index.svelte
		pattern: /^\/docs\/?$/,
		parts: [
			{ i: 1 },
			{ i: 2 }
		]
	},

	{
		// docs/csstokens/color/index.svelte
		pattern: /^\/docs\/csstokens\/color\/?$/,
		parts: [
			{ i: 1 },
			null,
			{ i: 3 }
		]
	}
];

if (typeof window !== 'undefined') {
	Promise.all([import('./sapper-dev-client.1e7a4a5e.js'), ]).then(function(x) { return x[0]; }).then(client => {
		client.connect(10000);
	});
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function find_anchor(node) {
    while (node && node.nodeName.toUpperCase() !== 'A')
        node = node.parentNode; // SVG <a> elements have a lowercase name
    return node;
}

let uid = 1;
function set_uid(n) {
    uid = n;
}
let cid;
function set_cid(n) {
    cid = n;
}
const _history = typeof history !== 'undefined' ? history : {
    pushState: () => { },
    replaceState: () => { },
    scrollRestoration: 'auto'
};
const scroll_history = {};
function load_current_page() {
    return Promise.resolve().then(() => {
        const { hash, href } = location;
        _history.replaceState({ id: uid }, '', href);
        const target = select_target(new URL(location.href));
        if (target)
            return navigate(target, uid, true, hash);
    });
}
let base_url;
let handle_target;
function init$1(base, handler) {
    base_url = base;
    handle_target = handler;
    if ('scrollRestoration' in _history) {
        _history.scrollRestoration = 'manual';
    }
    // Adopted from Nuxt.js
    // Reset scrollRestoration to auto when leaving page, allowing page reload
    // and back-navigation from other pages to use the browser to restore the
    // scrolling position.
    addEventListener('beforeunload', () => {
        _history.scrollRestoration = 'auto';
    });
    // Setting scrollRestoration to manual again when returning to this page.
    addEventListener('load', () => {
        _history.scrollRestoration = 'manual';
    });
    addEventListener('click', handle_click);
    addEventListener('popstate', handle_popstate);
}
function extract_query(search) {
    const query = Object.create(null);
    if (search.length > 0) {
        search.slice(1).split('&').forEach(searchParam => {
            const [, key, value = ''] = /([^=]*)(?:=(.*))?/.exec(decodeURIComponent(searchParam.replace(/\+/g, ' ')));
            if (typeof query[key] === 'string')
                query[key] = [query[key]];
            if (typeof query[key] === 'object')
                query[key].push(value);
            else
                query[key] = value;
        });
    }
    return query;
}
function select_target(url) {
    if (url.origin !== location.origin)
        return null;
    if (!url.pathname.startsWith(base_url))
        return null;
    let path = url.pathname.slice(base_url.length);
    if (path === '') {
        path = '/';
    }
    // avoid accidental clashes between server routes and page routes
    if (ignore.some(pattern => pattern.test(path)))
        return;
    for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i];
        const match = route.pattern.exec(path);
        if (match) {
            const query = extract_query(url.search);
            const part = route.parts[route.parts.length - 1];
            const params = part.params ? part.params(match) : {};
            const page = { host: location.host, path, query, params };
            return { href: url.href, route, match, page };
        }
    }
}
function handle_click(event) {
    // Adapted from https://github.com/visionmedia/page.js
    // MIT license https://github.com/visionmedia/page.js#license
    if (which(event) !== 1)
        return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
    if (event.defaultPrevented)
        return;
    const a = find_anchor(event.target);
    if (!a)
        return;
    if (!a.href)
        return;
    // check if link is inside an svg
    // in this case, both href and target are always inside an object
    const svg = typeof a.href === 'object' && a.href.constructor.name === 'SVGAnimatedString';
    const href = String(svg ? a.href.baseVal : a.href);
    if (href === location.href) {
        if (!location.hash)
            event.preventDefault();
        return;
    }
    // Ignore if tag has
    // 1. 'download' attribute
    // 2. rel='external' attribute
    if (a.hasAttribute('download') || a.getAttribute('rel') === 'external')
        return;
    // Ignore if <a> has a target
    if (svg ? a.target.baseVal : a.target)
        return;
    const url = new URL(href);
    // Don't handle hash changes
    if (url.pathname === location.pathname && url.search === location.search)
        return;
    const target = select_target(url);
    if (target) {
        const noscroll = a.hasAttribute('sapper:noscroll');
        navigate(target, null, noscroll, url.hash);
        event.preventDefault();
        _history.pushState({ id: cid }, '', url.href);
    }
}
function which(event) {
    return event.which === null ? event.button : event.which;
}
function scroll_state() {
    return {
        x: pageXOffset,
        y: pageYOffset
    };
}
function handle_popstate(event) {
    scroll_history[cid] = scroll_state();
    if (event.state) {
        const url = new URL(location.href);
        const target = select_target(url);
        if (target) {
            navigate(target, event.state.id);
        }
        else {
            // eslint-disable-next-line
            location.href = location.href; // nosonar
        }
    }
    else {
        // hashchange
        set_uid(uid + 1);
        set_cid(uid);
        _history.replaceState({ id: cid }, '', location.href);
    }
}
function navigate(dest, id, noscroll, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const popstate = !!id;
        if (popstate) {
            cid = id;
        }
        else {
            const current_scroll = scroll_state();
            // clicked on a link. preserve scroll state
            scroll_history[cid] = current_scroll;
            cid = id = ++uid;
            scroll_history[cid] = noscroll ? current_scroll : { x: 0, y: 0 };
        }
        yield handle_target(dest);
        if (document.activeElement && (document.activeElement instanceof HTMLElement))
            document.activeElement.blur();
        if (!noscroll) {
            let scroll = scroll_history[id];
            let deep_linked;
            if (hash) {
                // scroll is an element id (from a hash), we need to compute y.
                deep_linked = document.getElementById(hash.slice(1));
                if (deep_linked) {
                    scroll = {
                        x: 0,
                        y: deep_linked.getBoundingClientRect().top + scrollY
                    };
                }
            }
            scroll_history[cid] = scroll;
            if (popstate || deep_linked) {
                scrollTo(scroll.x, scroll.y);
            }
            else {
                scrollTo(0, 0);
            }
        }
    });
}

function get_base_uri(window_document) {
    let baseURI = window_document.baseURI;
    if (!baseURI) {
        const baseTags = window_document.getElementsByTagName('base');
        baseURI = baseTags.length ? baseTags[0].href : window_document.URL;
    }
    return baseURI;
}

let prefetching = null;
let mousemove_timeout;
function start() {
    addEventListener('touchstart', trigger_prefetch);
    addEventListener('mousemove', handle_mousemove);
}
function prefetch(href) {
    const target = select_target(new URL(href, get_base_uri(document)));
    if (target) {
        if (!prefetching || href !== prefetching.href) {
            prefetching = { href, promise: hydrate_target(target) };
        }
        return prefetching.promise;
    }
}
function get_prefetched(target) {
    if (prefetching && prefetching.href === target.href) {
        return prefetching.promise;
    }
    else {
        return hydrate_target(target);
    }
}
function trigger_prefetch(event) {
    const a = find_anchor(event.target);
    if (a && a.rel === 'prefetch') {
        prefetch(a.href);
    }
}
function handle_mousemove(event) {
    clearTimeout(mousemove_timeout);
    mousemove_timeout = setTimeout(() => {
        trigger_prefetch(event);
    }, 20);
}

function goto(href, opts = { noscroll: false, replaceState: false }) {
    const target = select_target(new URL(href, get_base_uri(document)));
    if (target) {
        _history[opts.replaceState ? 'replaceState' : 'pushState']({ id: cid }, '', href);
        return navigate(target, null, opts.noscroll);
    }
    location.href = href;
    return new Promise(() => {
        /* never resolves */
    });
}

function page_store(value) {
    const store = writable(value);
    let ready = true;
    function notify() {
        ready = true;
        store.update(val => val);
    }
    function set(new_value) {
        ready = false;
        store.set(new_value);
    }
    function subscribe(run) {
        let old_value;
        return store.subscribe((new_value) => {
            if (old_value === undefined || (ready && new_value !== old_value)) {
                run(old_value = new_value);
            }
        });
    }
    return { notify, set, subscribe };
}

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;
let ready = false;
let root_component;
let current_token;
let root_preloaded;
let current_branch = [];
let current_query = '{}';
const stores = {
    page: page_store({}),
    preloading: writable(null),
    session: writable(initial_data && initial_data.session)
};
let $session;
let session_dirty;
stores.session.subscribe((value) => __awaiter(void 0, void 0, void 0, function* () {
    $session = value;
    if (!ready)
        return;
    session_dirty = true;
    const dest = select_target(new URL(location.href));
    const token = current_token = {};
    const { redirect, props, branch } = yield hydrate_target(dest);
    if (token !== current_token)
        return; // a secondary navigation happened while we were loading
    if (redirect) {
        yield goto(redirect.location, { replaceState: true });
    }
    else {
        yield render(branch, props, buildPageContext(props, dest.page));
    }
}));
let target;
function set_target(node) {
    target = node;
}
function start$1(opts) {
    set_target(opts.target);
    init$1(initial_data.baseUrl, handle_target$1);
    start();
    if (initial_data.error) {
        return Promise.resolve().then(() => {
            return handle_error();
        });
    }
    return load_current_page();
}
function handle_error() {
    const { host, pathname, search } = location;
    const { session, preloaded, status, error } = initial_data;
    if (!root_preloaded) {
        root_preloaded = preloaded && preloaded[0];
    }
    const props = {
        error,
        status,
        session,
        level0: {
            props: root_preloaded
        },
        level1: {
            props: {
                status,
                error
            },
            component: Error$1
        },
        segments: preloaded
    };
    const query = extract_query(search);
    render([], props, { host, path: pathname, query, params: {}, error });
}
function buildPageContext(props, page) {
    const { error } = props;
    return Object.assign({ error }, page);
}
function handle_target$1(dest) {
    return __awaiter(this, void 0, void 0, function* () {
        if (root_component)
            stores.preloading.set(true);
        const hydrating = get_prefetched(dest);
        const token = current_token = {};
        const hydrated_target = yield hydrating;
        const { redirect } = hydrated_target;
        if (token !== current_token)
            return; // a secondary navigation happened while we were loading
        if (redirect) {
            yield goto(redirect.location, { replaceState: true });
        }
        else {
            const { props, branch } = hydrated_target;
            yield render(branch, props, buildPageContext(props, dest.page));
        }
    });
}
function render(branch, props, page) {
    return __awaiter(this, void 0, void 0, function* () {
        stores.page.set(page);
        stores.preloading.set(false);
        if (root_component) {
            root_component.$set(props);
        }
        else {
            props.stores = {
                page: { subscribe: stores.page.subscribe },
                preloading: { subscribe: stores.preloading.subscribe },
                session: stores.session
            };
            props.level0 = {
                props: yield root_preloaded
            };
            props.notify = stores.page.notify;
            root_component = new App({
                target,
                props,
                hydrate: true
            });
        }
        current_branch = branch;
        current_query = JSON.stringify(page.query);
        ready = true;
        session_dirty = false;
    });
}
function part_changed(i, segment, match, stringified_query) {
    // TODO only check query string changes for preload functions
    // that do in fact depend on it (using static analysis or
    // runtime instrumentation)
    if (stringified_query !== current_query)
        return true;
    const previous = current_branch[i];
    if (!previous)
        return false;
    if (segment !== previous.segment)
        return true;
    if (previous.match) {
        if (JSON.stringify(previous.match.slice(1, i + 2)) !== JSON.stringify(match.slice(1, i + 2))) {
            return true;
        }
    }
}
function hydrate_target(dest) {
    return __awaiter(this, void 0, void 0, function* () {
        const { route, page } = dest;
        const segments = page.path.split('/').filter(Boolean);
        let redirect = null;
        const props = { error: null, status: 200, segments: [segments[0]] };
        const preload_context = {
            fetch: (url, opts) => fetch(url, opts),
            redirect: (statusCode, location) => {
                if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
                    throw new Error('Conflicting redirects');
                }
                redirect = { statusCode, location };
            },
            error: (status, error) => {
                props.error = typeof error === 'string' ? new Error(error) : error;
                props.status = status;
            }
        };
        if (!root_preloaded) {
            const root_preload = undefined || (() => ({}));
            root_preloaded = initial_data.preloaded[0] || root_preload.call(preload_context, {
                host: page.host,
                path: page.path,
                query: page.query,
                params: {}
            }, $session);
        }
        let branch;
        let l = 1;
        try {
            const stringified_query = JSON.stringify(page.query);
            const match = route.pattern.exec(page.path);
            let segment_dirty = false;
            branch = yield Promise.all(route.parts.map((part, i) => __awaiter(this, void 0, void 0, function* () {
                const segment = segments[i];
                if (part_changed(i, segment, match, stringified_query))
                    segment_dirty = true;
                props.segments[l] = segments[i + 1]; // TODO make this less confusing
                if (!part)
                    return { segment };
                const j = l++;
                if (!session_dirty && !segment_dirty && current_branch[i] && current_branch[i].part === part.i) {
                    return current_branch[i];
                }
                segment_dirty = false;
                const { default: component, preload } = yield components[part.i].js();
                let preloaded;
                if (ready || !initial_data.preloaded[i + 1]) {
                    preloaded = preload
                        ? yield preload.call(preload_context, {
                            host: page.host,
                            path: page.path,
                            query: page.query,
                            params: part.params ? part.params(dest.match) : {}
                        }, $session)
                        : {};
                }
                else {
                    preloaded = initial_data.preloaded[i + 1];
                }
                return (props[`level${j}`] = { component, props: preloaded, segment, match, part: part.i });
            })));
        }
        catch (error) {
            props.error = error;
            props.status = 500;
            branch = [];
        }
        return { redirect, props, branch };
    });
}

const stores$1 = () => getContext(CONTEXT_KEY);

start$1({
	target: document.querySelector('#sapper')
});

export { current_component as A, getEventsAction as B, space as C, claim_space as D, toggle_class as E, action_destroyer as F, binding_callbacks as G, stores$1 as H, validate_store as I, component_subscribe as J, validate_each_argument as K, empty as L, group_outros as M, check_outros as N, destroy_each as O, createCommonjsModule as P, commonjsGlobal as Q, SvelteComponentDev as S, children as a, claim_text as b, claim_element as c, dispatch_dev as d, element as e, detach_dev as f, attr_dev as g, add_location as h, init as i, insert_dev as j, append_dev as k, set_data_dev as l, create_component as m, noop as n, onMount as o, claim_component as p, mount_component as q, transition_in as r, safe_not_equal as s, text as t, transition_out as u, validate_slots as v, destroy_component as w, create_slot as x, update_slot as y, afterUpdate as z };

import __inject_styles from './inject_styles.5607aec6.js';//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LjFmNTk4MDI0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL2ludGVybmFsL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3RvcmUvaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2ludGVybmFsL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3N2ZWx0ZS1zcGVjdHJ1bS1pY29ucy11aS9zcmMvQWxlcnRNZWRpdW0uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9zdmVsdGUtc3BlY3RydW0taWNvbnMtdWkvc3JjL0NoZWNrbWFya01lZGl1bS5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3N2ZWx0ZS1zcGVjdHJ1bS1pY29ucy11aS9zcmMvQ2hldnJvbkRvd25NZWRpdW0uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9zdmVsdGUtc3BlY3RydW0taWNvbnMtdWkvc3JjL0NoZXZyb25SaWdodE1lZGl1bS5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVzaXplLW9ic2VydmVyLXBvbHlmaWxsL2Rpc3QvUmVzaXplT2JzZXJ2ZXIuZXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3J1YnVzL3NyYy9wYWNrYWdlcy91dGlscy9nZXQtZXZlbnRzLWFjdGlvbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL0FjdGlvbkdyb3VwL0FjdGlvbkdyb3VwLnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL0J1dHRvbi9CdXR0b24uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvdXRpbHMvZWxlbWVudC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL1BvcG92ZXIvUG9wb3Zlci5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3J1YnVzL3NyYy9wYWNrYWdlcy9DYWxlbmRhci9maXgtZGF0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1uYW1lL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3NpbXBsZS1zd2l6emxlL25vZGVfbW9kdWxlcy9pcy1hcnJheWlzaC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zaW1wbGUtc3dpenpsZS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1zdHJpbmcvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1jb252ZXJ0L2NvbnZlcnNpb25zLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvcm91dGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL3V0aWxzL2NvbG9yL2NvbG9yLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvQ29ybmVyc3RvbmUvQ29ybmVyc3RvbmUuc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvTWVudS9NZW51LnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL01lbnUvTWVudUl0ZW0uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvRHJvcGRvd24vRHJvcGRvd24uc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvbmF2L05hdi5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvcm91dGVzL19sYXlvdXQuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9fZXJyb3Iuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2ludGVybmFsL0FwcC5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvbm9kZV9tb2R1bGVzL0BzYXBwZXIvaW50ZXJuYWwvbWFuaWZlc3QtY2xpZW50Lm1qcyIsIi4uLy4uLy4uL3NyYy9ub2RlX21vZHVsZXMvQHNhcHBlci9hcHAubWpzIiwiLi4vLi4vLi4vc3JjL2NsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBub29wKCkgeyB9XG5jb25zdCBpZGVudGl0eSA9IHggPT4geDtcbmZ1bmN0aW9uIGFzc2lnbih0YXIsIHNyYykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBmb3IgKGNvbnN0IGsgaW4gc3JjKVxuICAgICAgICB0YXJba10gPSBzcmNba107XG4gICAgcmV0dXJuIHRhcjtcbn1cbmZ1bmN0aW9uIGlzX3Byb21pc2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIGFkZF9sb2NhdGlvbihlbGVtZW50LCBmaWxlLCBsaW5lLCBjb2x1bW4sIGNoYXIpIHtcbiAgICBlbGVtZW50Ll9fc3ZlbHRlX21ldGEgPSB7XG4gICAgICAgIGxvYzogeyBmaWxlLCBsaW5lLCBjb2x1bW4sIGNoYXIgfVxuICAgIH07XG59XG5mdW5jdGlvbiBydW4oZm4pIHtcbiAgICByZXR1cm4gZm4oKTtcbn1cbmZ1bmN0aW9uIGJsYW5rX29iamVjdCgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cbmZ1bmN0aW9uIHJ1bl9hbGwoZm5zKSB7XG4gICAgZm5zLmZvckVhY2gocnVuKTtcbn1cbmZ1bmN0aW9uIGlzX2Z1bmN0aW9uKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIHNhZmVfbm90X2VxdWFsKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPSBhID8gYiA9PSBiIDogYSAhPT0gYiB8fCAoKGEgJiYgdHlwZW9mIGEgPT09ICdvYmplY3QnKSB8fCB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5mdW5jdGlvbiBub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiO1xufVxuZnVuY3Rpb24gaXNfZW1wdHkob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfc3RvcmUoc3RvcmUsIG5hbWUpIHtcbiAgICBpZiAoc3RvcmUgIT0gbnVsbCAmJiB0eXBlb2Ygc3RvcmUuc3Vic2NyaWJlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7bmFtZX0nIGlzIG5vdCBhIHN0b3JlIHdpdGggYSAnc3Vic2NyaWJlJyBtZXRob2RgKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzdWJzY3JpYmUoc3RvcmUsIC4uLmNhbGxiYWNrcykge1xuICAgIGlmIChzdG9yZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IHN0b3JlLnN1YnNjcmliZSguLi5jYWxsYmFja3MpO1xuICAgIHJldHVybiB1bnN1Yi51bnN1YnNjcmliZSA/ICgpID0+IHVuc3ViLnVuc3Vic2NyaWJlKCkgOiB1bnN1Yjtcbn1cbmZ1bmN0aW9uIGdldF9zdG9yZV92YWx1ZShzdG9yZSkge1xuICAgIGxldCB2YWx1ZTtcbiAgICBzdWJzY3JpYmUoc3RvcmUsIF8gPT4gdmFsdWUgPSBfKSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudF9zdWJzY3JpYmUoY29tcG9uZW50LCBzdG9yZSwgY2FsbGJhY2spIHtcbiAgICBjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKHN1YnNjcmliZShzdG9yZSwgY2FsbGJhY2spKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zbG90KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICBjb25zdCBzbG90X2N0eCA9IGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbik7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uWzBdKHNsb3RfY3R4KTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvblsxXSAmJiBmblxuICAgICAgICA/IGFzc2lnbigkJHNjb3BlLmN0eC5zbGljZSgpLCBkZWZpbml0aW9uWzFdKGZuKGN0eCkpKVxuICAgICAgICA6ICQkc2NvcGUuY3R4O1xufVxuZnVuY3Rpb24gZ2V0X3Nsb3RfY2hhbmdlcyhkZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvblsyXSAmJiBmbikge1xuICAgICAgICBjb25zdCBsZXRzID0gZGVmaW5pdGlvblsyXShmbihkaXJ0eSkpO1xuICAgICAgICBpZiAoJCRzY29wZS5kaXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbGV0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxldHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KCQkc2NvcGUuZGlydHkubGVuZ3RoLCBsZXRzLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0gJCRzY29wZS5kaXJ0eVtpXSB8IGxldHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkJHNjb3BlLmRpcnR5IHwgbGV0cztcbiAgICB9XG4gICAgcmV0dXJuICQkc2NvcGUuZGlydHk7XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdChzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZGlydHksIGdldF9zbG90X2NoYW5nZXNfZm4sIGdldF9zbG90X2NvbnRleHRfZm4pIHtcbiAgICBjb25zdCBzbG90X2NoYW5nZXMgPSBnZXRfc2xvdF9jaGFuZ2VzKHNsb3RfZGVmaW5pdGlvbiwgJCRzY29wZSwgZGlydHksIGdldF9zbG90X2NoYW5nZXNfZm4pO1xuICAgIGlmIChzbG90X2NoYW5nZXMpIHtcbiAgICAgICAgY29uc3Qgc2xvdF9jb250ZXh0ID0gZ2V0X3Nsb3RfY29udGV4dChzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZ2V0X3Nsb3RfY29udGV4dF9mbik7XG4gICAgICAgIHNsb3QucChzbG90X2NvbnRleHQsIHNsb3RfY2hhbmdlcyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZXhjbHVkZV9pbnRlcm5hbF9wcm9wcyhwcm9wcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBwcm9wcylcbiAgICAgICAgaWYgKGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb21wdXRlX3Jlc3RfcHJvcHMocHJvcHMsIGtleXMpIHtcbiAgICBjb25zdCByZXN0ID0ge307XG4gICAga2V5cyA9IG5ldyBTZXQoa2V5cyk7XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoIWtleXMuaGFzKGspICYmIGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3Rba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfc2xvdHMoc2xvdHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzbG90cykge1xuICAgICAgICByZXN1bHRba2V5XSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgbGV0IHJhbiA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAocmFuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByYW4gPSB0cnVlO1xuICAgICAgICBmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG59XG5mdW5jdGlvbiBudWxsX3RvX2VtcHR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X3N0b3JlX3ZhbHVlKHN0b3JlLCByZXQsIHZhbHVlID0gcmV0KSB7XG4gICAgc3RvcmUuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gcmV0O1xufVxuY29uc3QgaGFzX3Byb3AgPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbmZ1bmN0aW9uIGFjdGlvbl9kZXN0cm95ZXIoYWN0aW9uX3Jlc3VsdCkge1xuICAgIHJldHVybiBhY3Rpb25fcmVzdWx0ICYmIGlzX2Z1bmN0aW9uKGFjdGlvbl9yZXN1bHQuZGVzdHJveSkgPyBhY3Rpb25fcmVzdWx0LmRlc3Ryb3kgOiBub29wO1xufVxuXG5jb25zdCBpc19jbGllbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbmxldCBub3cgPSBpc19jbGllbnRcbiAgICA/ICgpID0+IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgIDogKCkgPT4gRGF0ZS5ub3coKTtcbmxldCByYWYgPSBpc19jbGllbnQgPyBjYiA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2IpIDogbm9vcDtcbi8vIHVzZWQgaW50ZXJuYWxseSBmb3IgdGVzdGluZ1xuZnVuY3Rpb24gc2V0X25vdyhmbikge1xuICAgIG5vdyA9IGZuO1xufVxuZnVuY3Rpb24gc2V0X3JhZihmbikge1xuICAgIHJhZiA9IGZuO1xufVxuXG5jb25zdCB0YXNrcyA9IG5ldyBTZXQoKTtcbmZ1bmN0aW9uIHJ1bl90YXNrcyhub3cpIHtcbiAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xuICAgICAgICBpZiAoIXRhc2suYyhub3cpKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgICAgICB0YXNrLmYoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh0YXNrcy5zaXplICE9PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbn1cbi8qKlxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMgb25seSFcbiAqL1xuZnVuY3Rpb24gY2xlYXJfbG9vcHMoKSB7XG4gICAgdGFza3MuY2xlYXIoKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB0YXNrIHRoYXQgcnVucyBvbiBlYWNoIHJhZiBmcmFtZVxuICogdW50aWwgaXQgcmV0dXJucyBhIGZhbHN5IHZhbHVlIG9yIGlzIGFib3J0ZWRcbiAqL1xuZnVuY3Rpb24gbG9vcChjYWxsYmFjaykge1xuICAgIGxldCB0YXNrO1xuICAgIGlmICh0YXNrcy5zaXplID09PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBuZXcgUHJvbWlzZShmdWxmaWxsID0+IHtcbiAgICAgICAgICAgIHRhc2tzLmFkZCh0YXNrID0geyBjOiBjYWxsYmFjaywgZjogZnVsZmlsbCB9KTtcbiAgICAgICAgfSksXG4gICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kKHRhcmdldCwgbm9kZSkge1xuICAgIHRhcmdldC5hcHBlbmRDaGlsZChub2RlKTtcbn1cbmZ1bmN0aW9uIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgYW5jaG9yIHx8IG51bGwpO1xufVxuZnVuY3Rpb24gZGV0YWNoKG5vZGUpIHtcbiAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG59XG5mdW5jdGlvbiBkZXN0cm95X2VhY2goaXRlcmF0aW9ucywgZGV0YWNoaW5nKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChpdGVyYXRpb25zW2ldKVxuICAgICAgICAgICAgaXRlcmF0aW9uc1tpXS5kKGRldGFjaGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSk7XG59XG5mdW5jdGlvbiBlbGVtZW50X2lzKG5hbWUsIGlzKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSwgeyBpcyB9KTtcbn1cbmZ1bmN0aW9uIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMob2JqLCBleGNsdWRlKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0ge307XG4gICAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgICAgICBpZiAoaGFzX3Byb3Aob2JqLCBrKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgJiYgZXhjbHVkZS5pbmRleE9mKGspID09PSAtMSkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgdGFyZ2V0W2tdID0gb2JqW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBzdmdfZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBuYW1lKTtcbn1cbmZ1bmN0aW9uIHRleHQoZGF0YSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKTtcbn1cbmZ1bmN0aW9uIHNwYWNlKCkge1xuICAgIHJldHVybiB0ZXh0KCcgJyk7XG59XG5mdW5jdGlvbiBlbXB0eSgpIHtcbiAgICByZXR1cm4gdGV4dCgnJyk7XG59XG5mdW5jdGlvbiBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcHJldmVudF9kZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc3RvcF9wcm9wYWdhdGlvbihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzZWxmKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMpXG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpXG4gICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgZWxzZSBpZiAobm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpXG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gc2V0X2F0dHJpYnV0ZXMobm9kZSwgYXR0cmlidXRlcykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG5vZGUuX19wcm90b19fKTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzW2tleV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuY3NzVGV4dCA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdfX3ZhbHVlJykge1xuICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZXNjcmlwdG9yc1trZXldICYmIGRlc2NyaXB0b3JzW2tleV0uc2V0KSB7XG4gICAgICAgICAgICBub2RlW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdmdfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YShub2RlLCBwcm9wLCB2YWx1ZSkge1xuICAgIGlmIChwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgbm9kZVtwcm9wXSA9IHZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYXR0cihub2RlLCBwcm9wLCB2YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24geGxpbmtfYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIGF0dHJpYnV0ZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUoZ3JvdXAsIF9fdmFsdWUsIGNoZWNrZWQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyb3VwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChncm91cFtpXS5jaGVja2VkKVxuICAgICAgICAgICAgdmFsdWUuYWRkKGdyb3VwW2ldLl9fdmFsdWUpO1xuICAgIH1cbiAgICBpZiAoIWNoZWNrZWQpIHtcbiAgICAgICAgdmFsdWUuZGVsZXRlKF9fdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG59XG5mdW5jdGlvbiB0b19udW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09ICcnID8gbnVsbCA6ICt2YWx1ZTtcbn1cbmZ1bmN0aW9uIHRpbWVfcmFuZ2VzX3RvX2FycmF5KHJhbmdlcykge1xuICAgIGNvbnN0IGFycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYXJyYXkucHVzaCh7IHN0YXJ0OiByYW5nZXMuc3RhcnQoaSksIGVuZDogcmFuZ2VzLmVuZChpKSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZnVuY3Rpb24gY2hpbGRyZW4oZWxlbWVudCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2hpbGROb2Rlcyk7XG59XG5mdW5jdGlvbiBjbGFpbV9lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBzdmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZSA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKGogPCBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbm9kZS5hdHRyaWJ1dGVzW2orK107XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmUucHVzaChhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCByZW1vdmUubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShyZW1vdmVba10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzLnNwbGljZShpLCAxKVswXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3ZnID8gc3ZnX2VsZW1lbnQobmFtZSkgOiBlbGVtZW50KG5hbWUpO1xufVxuZnVuY3Rpb24gY2xhaW1fdGV4dChub2RlcywgZGF0YSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gJycgKyBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGVzLnNwbGljZShpLCAxKVswXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGV4dChkYXRhKTtcbn1cbmZ1bmN0aW9uIGNsYWltX3NwYWNlKG5vZGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX3RleHQobm9kZXMsICcgJyk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YSh0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgIT09IGRhdGEpXG4gICAgICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiBzZXRfaW5wdXRfdmFsdWUoaW5wdXQsIHZhbHVlKSB7XG4gICAgaW5wdXQudmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF90eXBlKGlucHV0LCB0eXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaW5wdXQudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3R5bGUobm9kZSwga2V5LCB2YWx1ZSwgaW1wb3J0YW50KSB7XG4gICAgbm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnQgPyAnaW1wb3J0YW50JyA6ICcnKTtcbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb24oc2VsZWN0LCB2YWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0Lm9wdGlvbnNbaV07XG4gICAgICAgIGlmIChvcHRpb24uX192YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzZWxlY3Rfb3B0aW9ucyhzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gfnZhbHVlLmluZGV4T2Yob3B0aW9uLl9fdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF92YWx1ZShzZWxlY3QpIHtcbiAgICBjb25zdCBzZWxlY3RlZF9vcHRpb24gPSBzZWxlY3QucXVlcnlTZWxlY3RvcignOmNoZWNrZWQnKSB8fCBzZWxlY3Qub3B0aW9uc1swXTtcbiAgICByZXR1cm4gc2VsZWN0ZWRfb3B0aW9uICYmIHNlbGVjdGVkX29wdGlvbi5fX3ZhbHVlO1xufVxuZnVuY3Rpb24gc2VsZWN0X211bHRpcGxlX3ZhbHVlKHNlbGVjdCkge1xuICAgIHJldHVybiBbXS5tYXAuY2FsbChzZWxlY3QucXVlcnlTZWxlY3RvckFsbCgnOmNoZWNrZWQnKSwgb3B0aW9uID0+IG9wdGlvbi5fX3ZhbHVlKTtcbn1cbi8vIHVuZm9ydHVuYXRlbHkgdGhpcyBjYW4ndCBiZSBhIGNvbnN0YW50IGFzIHRoYXQgd291bGRuJ3QgYmUgdHJlZS1zaGFrZWFibGVcbi8vIHNvIHdlIGNhY2hlIHRoZSByZXN1bHQgaW5zdGVhZFxubGV0IGNyb3Nzb3JpZ2luO1xuZnVuY3Rpb24gaXNfY3Jvc3NvcmlnaW4oKSB7XG4gICAgaWYgKGNyb3Nzb3JpZ2luID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3Jvc3NvcmlnaW4gPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdm9pZCB3aW5kb3cucGFyZW50LmRvY3VtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY3Jvc3NvcmlnaW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcm9zc29yaWdpbjtcbn1cbmZ1bmN0aW9uIGFkZF9yZXNpemVfbGlzdGVuZXIobm9kZSwgZm4pIHtcbiAgICBjb25zdCBjb21wdXRlZF9zdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3Qgel9pbmRleCA9IChwYXJzZUludChjb21wdXRlZF9zdHlsZS56SW5kZXgpIHx8IDApIC0gMTtcbiAgICBpZiAoY29tcHV0ZWRfc3R5bGUucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIH1cbiAgICBjb25zdCBpZnJhbWUgPSBlbGVtZW50KCdpZnJhbWUnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7ICcgK1xuICAgICAgICBgb3ZlcmZsb3c6IGhpZGRlbjsgYm9yZGVyOiAwOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogJHt6X2luZGV4fTtgKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgaWZyYW1lLnRhYkluZGV4ID0gLTE7XG4gICAgY29uc3QgY3Jvc3NvcmlnaW4gPSBpc19jcm9zc29yaWdpbigpO1xuICAgIGxldCB1bnN1YnNjcmliZTtcbiAgICBpZiAoY3Jvc3NvcmlnaW4pIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9IFwiZGF0YTp0ZXh0L2h0bWwsPHNjcmlwdD5vbnJlc2l6ZT1mdW5jdGlvbigpe3BhcmVudC5wb3N0TWVzc2FnZSgwLCcqJyl9PC9zY3JpcHQ+XCI7XG4gICAgICAgIHVuc3Vic2NyaWJlID0gbGlzdGVuKHdpbmRvdywgJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IGlmcmFtZS5jb250ZW50V2luZG93KVxuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICAgIGlmcmFtZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3RlbihpZnJhbWUuY29udGVudFdpbmRvdywgJ3Jlc2l6ZScsIGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXBwZW5kKG5vZGUsIGlmcmFtZSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVuc3Vic2NyaWJlICYmIGlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRldGFjaChpZnJhbWUpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0b2dnbGVfY2xhc3MoZWxlbWVudCwgbmFtZSwgdG9nZ2xlKSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3RbdG9nZ2xlID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG59XG5mdW5jdGlvbiBjdXN0b21fZXZlbnQodHlwZSwgZGV0YWlsKSB7XG4gICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgZGV0YWlsKTtcbiAgICByZXR1cm4gZTtcbn1cbmZ1bmN0aW9uIHF1ZXJ5X3NlbGVjdG9yX2FsbChzZWxlY3RvciwgcGFyZW50ID0gZG9jdW1lbnQuYm9keSkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG59XG5jbGFzcyBIdG1sVGFnIHtcbiAgICBjb25zdHJ1Y3RvcihhbmNob3IgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYSA9IGFuY2hvcjtcbiAgICAgICAgdGhpcy5lID0gdGhpcy5uID0gbnVsbDtcbiAgICB9XG4gICAgbShodG1sLCB0YXJnZXQsIGFuY2hvciA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmUpIHtcbiAgICAgICAgICAgIHRoaXMuZSA9IGVsZW1lbnQodGFyZ2V0Lm5vZGVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMudCA9IHRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuaChodG1sKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmkoYW5jaG9yKTtcbiAgICB9XG4gICAgaChodG1sKSB7XG4gICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB0aGlzLm4gPSBBcnJheS5mcm9tKHRoaXMuZS5jaGlsZE5vZGVzKTtcbiAgICB9XG4gICAgaShhbmNob3IpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluc2VydCh0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwKGh0bWwpIHtcbiAgICAgICAgdGhpcy5kKCk7XG4gICAgICAgIHRoaXMuaChodG1sKTtcbiAgICAgICAgdGhpcy5pKHRoaXMuYSk7XG4gICAgfVxuICAgIGQoKSB7XG4gICAgICAgIHRoaXMubi5mb3JFYWNoKGRldGFjaCk7XG4gICAgfVxufVxuXG5jb25zdCBhY3RpdmVfZG9jcyA9IG5ldyBTZXQoKTtcbmxldCBhY3RpdmUgPSAwO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhcmtza3lhcHAvc3RyaW5nLWhhc2gvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGhhc2goc3RyKSB7XG4gICAgbGV0IGhhc2ggPSA1MzgxO1xuICAgIGxldCBpID0gc3RyLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgXiBzdHIuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9ydWxlKG5vZGUsIGEsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzZSwgZm4sIHVpZCA9IDApIHtcbiAgICBjb25zdCBzdGVwID0gMTYuNjY2IC8gZHVyYXRpb247XG4gICAgbGV0IGtleWZyYW1lcyA9ICd7XFxuJztcbiAgICBmb3IgKGxldCBwID0gMDsgcCA8PSAxOyBwICs9IHN0ZXApIHtcbiAgICAgICAgY29uc3QgdCA9IGEgKyAoYiAtIGEpICogZWFzZShwKTtcbiAgICAgICAga2V5ZnJhbWVzICs9IHAgKiAxMDAgKyBgJXske2ZuKHQsIDEgLSB0KX19XFxuYDtcbiAgICB9XG4gICAgY29uc3QgcnVsZSA9IGtleWZyYW1lcyArIGAxMDAlIHske2ZuKGIsIDEgLSBiKX19XFxufWA7XG4gICAgY29uc3QgbmFtZSA9IGBfX3N2ZWx0ZV8ke2hhc2gocnVsZSl9XyR7dWlkfWA7XG4gICAgY29uc3QgZG9jID0gbm9kZS5vd25lckRvY3VtZW50O1xuICAgIGFjdGl2ZV9kb2NzLmFkZChkb2MpO1xuICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBkb2MuX19zdmVsdGVfc3R5bGVzaGVldCB8fCAoZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQgPSBkb2MuaGVhZC5hcHBlbmRDaGlsZChlbGVtZW50KCdzdHlsZScpKS5zaGVldCk7XG4gICAgY29uc3QgY3VycmVudF9ydWxlcyA9IGRvYy5fX3N2ZWx0ZV9ydWxlcyB8fCAoZG9jLl9fc3ZlbHRlX3J1bGVzID0ge30pO1xuICAgIGlmICghY3VycmVudF9ydWxlc1tuYW1lXSkge1xuICAgICAgICBjdXJyZW50X3J1bGVzW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgc3R5bGVzaGVldC5pbnNlcnRSdWxlKGBAa2V5ZnJhbWVzICR7bmFtZX0gJHtydWxlfWAsIHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICB9XG4gICAgY29uc3QgYW5pbWF0aW9uID0gbm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJyc7XG4gICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBgJHthbmltYXRpb24gPyBgJHthbmltYXRpb259LCBgIDogJyd9JHtuYW1lfSAke2R1cmF0aW9ufW1zIGxpbmVhciAke2RlbGF5fW1zIDEgYm90aGA7XG4gICAgYWN0aXZlICs9IDE7XG4gICAgcmV0dXJuIG5hbWU7XG59XG5mdW5jdGlvbiBkZWxldGVfcnVsZShub2RlLCBuYW1lKSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSAobm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIGNvbnN0IG5leHQgPSBwcmV2aW91cy5maWx0ZXIobmFtZVxuICAgICAgICA/IGFuaW0gPT4gYW5pbS5pbmRleE9mKG5hbWUpIDwgMCAvLyByZW1vdmUgc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgICAgIDogYW5pbSA9PiBhbmltLmluZGV4T2YoJ19fc3ZlbHRlJykgPT09IC0xIC8vIHJlbW92ZSBhbGwgU3ZlbHRlIGFuaW1hdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBwcmV2aW91cy5sZW5ndGggLSBuZXh0Lmxlbmd0aDtcbiAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IG5leHQuam9pbignLCAnKTtcbiAgICAgICAgYWN0aXZlIC09IGRlbGV0ZWQ7XG4gICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgY2xlYXJfcnVsZXMoKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhcl9ydWxlcygpIHtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhY3RpdmVfZG9jcy5mb3JFYWNoKGRvYyA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdHlsZXNoZWV0ID0gZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQ7XG4gICAgICAgICAgICBsZXQgaSA9IHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGktLSlcbiAgICAgICAgICAgICAgICBzdHlsZXNoZWV0LmRlbGV0ZVJ1bGUoaSk7XG4gICAgICAgICAgICBkb2MuX19zdmVsdGVfcnVsZXMgPSB7fTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFjdGl2ZV9kb2NzLmNsZWFyKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZV9hbmltYXRpb24obm9kZSwgZnJvbSwgZm4sIHBhcmFtcykge1xuICAgIGlmICghZnJvbSlcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgY29uc3QgdG8gPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChmcm9tLmxlZnQgPT09IHRvLmxlZnQgJiYgZnJvbS5yaWdodCA9PT0gdG8ucmlnaHQgJiYgZnJvbS50b3AgPT09IHRvLnRvcCAmJiBmcm9tLmJvdHRvbSA9PT0gdG8uYm90dG9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86IHNob3VsZCB0aGlzIGJlIHNlcGFyYXRlZCBmcm9tIGRlc3RydWN0dXJpbmc/IE9yIHN0YXJ0L2VuZCBhZGRlZCB0byBwdWJsaWMgYXBpIGFuZCBkb2N1bWVudGF0aW9uP1xuICAgIHN0YXJ0OiBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheSwgXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOlxuICAgIGVuZCA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbiwgdGljayA9IG5vb3AsIGNzcyB9ID0gZm4obm9kZSwgeyBmcm9tLCB0byB9LCBwYXJhbXMpO1xuICAgIGxldCBydW5uaW5nID0gdHJ1ZTtcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIGxldCBuYW1lO1xuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICBuYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZWxheSkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpO1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgaWYgKCFzdGFydGVkICYmIG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnRlZCAmJiBub3cgPj0gZW5kKSB7XG4gICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gbm93IC0gc3RhcnRfdGltZTtcbiAgICAgICAgICAgIGNvbnN0IHQgPSAwICsgMSAqIGVhc2luZyhwIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgc3RhcnQoKTtcbiAgICB0aWNrKDAsIDEpO1xuICAgIHJldHVybiBzdG9wO1xufVxuZnVuY3Rpb24gZml4X3Bvc2l0aW9uKG5vZGUpIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKHN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnICYmIHN0eWxlLnBvc2l0aW9uICE9PSAnZml4ZWQnKSB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gc3R5bGU7XG4gICAgICAgIGNvbnN0IGEgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgbm9kZS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgYWRkX3RyYW5zZm9ybShub2RlLCBhKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpIHtcbiAgICBjb25zdCBiID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoYS5sZWZ0ICE9PSBiLmxlZnQgfHwgYS50b3AgIT09IGIudG9wKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbm9kZS5zdHlsZS50cmFuc2Zvcm0gPSBgJHt0cmFuc2Zvcm19IHRyYW5zbGF0ZSgke2EubGVmdCAtIGIubGVmdH1weCwgJHthLnRvcCAtIGIudG9wfXB4KWA7XG4gICAgfVxufVxuXG5sZXQgY3VycmVudF9jb21wb25lbnQ7XG5mdW5jdGlvbiBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgY3VycmVudF9jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBnZXRfY3VycmVudF9jb21wb25lbnQoKSB7XG4gICAgaWYgKCFjdXJyZW50X2NvbXBvbmVudClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb3V0c2lkZSBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24nKTtcbiAgICByZXR1cm4gY3VycmVudF9jb21wb25lbnQ7XG59XG5mdW5jdGlvbiBiZWZvcmVVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5iZWZvcmVfdXBkYXRlLnB1c2goZm4pO1xufVxuZnVuY3Rpb24gb25Nb3VudChmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX21vdW50LnB1c2goZm4pO1xufVxuZnVuY3Rpb24gYWZ0ZXJVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5hZnRlcl91cGRhdGUucHVzaChmbik7XG59XG5mdW5jdGlvbiBvbkRlc3Ryb3koZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9kZXN0cm95LnB1c2goZm4pO1xufVxuZnVuY3Rpb24gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCkge1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IGdldF9jdXJyZW50X2NvbXBvbmVudCgpO1xuICAgIHJldHVybiAodHlwZSwgZGV0YWlsKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbdHlwZV07XG4gICAgICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gYXJlIHRoZXJlIHNpdHVhdGlvbnMgd2hlcmUgZXZlbnRzIGNvdWxkIGJlIGRpc3BhdGNoZWRcbiAgICAgICAgICAgIC8vIGluIGEgc2VydmVyIChub24tRE9NKSBlbnZpcm9ubWVudD9cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCk7XG4gICAgICAgICAgICBjYWxsYmFja3Muc2xpY2UoKS5mb3JFYWNoKGZuID0+IHtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKGNvbXBvbmVudCwgZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gc2V0Q29udGV4dChrZXksIGNvbnRleHQpIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LnNldChrZXksIGNvbnRleHQpO1xufVxuZnVuY3Rpb24gZ2V0Q29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5nZXQoa2V5KTtcbn1cbi8vIFRPRE8gZmlndXJlIG91dCBpZiB3ZSBzdGlsbCB3YW50IHRvIHN1cHBvcnRcbi8vIHNob3J0aGFuZCBldmVudHMsIG9yIGlmIHdlIHdhbnQgdG8gaW1wbGVtZW50XG4vLyBhIHJlYWwgYnViYmxpbmcgbWVjaGFuaXNtXG5mdW5jdGlvbiBidWJibGUoY29tcG9uZW50LCBldmVudCkge1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbZXZlbnQudHlwZV07XG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICBjYWxsYmFja3Muc2xpY2UoKS5mb3JFYWNoKGZuID0+IGZuKGV2ZW50KSk7XG4gICAgfVxufVxuXG5jb25zdCBkaXJ0eV9jb21wb25lbnRzID0gW107XG5jb25zdCBpbnRyb3MgPSB7IGVuYWJsZWQ6IGZhbHNlIH07XG5jb25zdCBiaW5kaW5nX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgcmVuZGVyX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgZmx1c2hfY2FsbGJhY2tzID0gW107XG5jb25zdCByZXNvbHZlZF9wcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5sZXQgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuZnVuY3Rpb24gc2NoZWR1bGVfdXBkYXRlKCkge1xuICAgIGlmICghdXBkYXRlX3NjaGVkdWxlZCkge1xuICAgICAgICB1cGRhdGVfc2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZWRfcHJvbWlzZS50aGVuKGZsdXNoKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0aWNrKCkge1xuICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgIHJldHVybiByZXNvbHZlZF9wcm9taXNlO1xufVxuZnVuY3Rpb24gYWRkX3JlbmRlcl9jYWxsYmFjayhmbikge1xuICAgIHJlbmRlcl9jYWxsYmFja3MucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZGRfZmx1c2hfY2FsbGJhY2soZm4pIHtcbiAgICBmbHVzaF9jYWxsYmFja3MucHVzaChmbik7XG59XG5sZXQgZmx1c2hpbmcgPSBmYWxzZTtcbmNvbnN0IHNlZW5fY2FsbGJhY2tzID0gbmV3IFNldCgpO1xuZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgaWYgKGZsdXNoaW5nKVxuICAgICAgICByZXR1cm47XG4gICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgIGRvIHtcbiAgICAgICAgLy8gZmlyc3QsIGNhbGwgYmVmb3JlVXBkYXRlIGZ1bmN0aW9uc1xuICAgICAgICAvLyBhbmQgdXBkYXRlIGNvbXBvbmVudHNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBkaXJ0eV9jb21wb25lbnRzW2ldO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoY29tcG9uZW50LiQkKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoID0gMDtcbiAgICAgICAgd2hpbGUgKGJpbmRpbmdfY2FsbGJhY2tzLmxlbmd0aClcbiAgICAgICAgICAgIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgICAgIC8vIHRoZW4sIG9uY2UgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgY2FsbFxuICAgICAgICAvLyBhZnRlclVwZGF0ZSBmdW5jdGlvbnMuIFRoaXMgbWF5IGNhdXNlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gcmVuZGVyX2NhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICghc2Vlbl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICBzZWVuX2NhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIH0gd2hpbGUgKGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoKTtcbiAgICB3aGlsZSAoZmx1c2hfY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmbHVzaF9jYWxsYmFja3MucG9wKCkoKTtcbiAgICB9XG4gICAgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgc2Vlbl9jYWxsYmFja3MuY2xlYXIoKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZSgkJCkge1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAkJC51cGRhdGUoKTtcbiAgICAgICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAgICAgY29uc3QgZGlydHkgPSAkJC5kaXJ0eTtcbiAgICAgICAgJCQuZGlydHkgPSBbLTFdO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5wKCQkLmN0eCwgZGlydHkpO1xuICAgICAgICAkJC5hZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbiAgICB9XG59XG5cbmxldCBwcm9taXNlO1xuZnVuY3Rpb24gd2FpdCgpIHtcbiAgICBpZiAoIXByb21pc2UpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGRpc3BhdGNoKG5vZGUsIGRpcmVjdGlvbiwga2luZCkge1xuICAgIG5vZGUuZGlzcGF0Y2hFdmVudChjdXN0b21fZXZlbnQoYCR7ZGlyZWN0aW9uID8gJ2ludHJvJyA6ICdvdXRybyd9JHtraW5kfWApKTtcbn1cbmNvbnN0IG91dHJvaW5nID0gbmV3IFNldCgpO1xubGV0IG91dHJvcztcbmZ1bmN0aW9uIGdyb3VwX291dHJvcygpIHtcbiAgICBvdXRyb3MgPSB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGM6IFtdLFxuICAgICAgICBwOiBvdXRyb3MgLy8gcGFyZW50IGdyb3VwXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNoZWNrX291dHJvcygpIHtcbiAgICBpZiAoIW91dHJvcy5yKSB7XG4gICAgICAgIHJ1bl9hbGwob3V0cm9zLmMpO1xuICAgIH1cbiAgICBvdXRyb3MgPSBvdXRyb3MucDtcbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25faW4oYmxvY2ssIGxvY2FsKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLmkpIHtcbiAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgYmxvY2suaShsb2NhbCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9vdXQoYmxvY2ssIGxvY2FsLCBkZXRhY2gsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLm8pIHtcbiAgICAgICAgaWYgKG91dHJvaW5nLmhhcyhibG9jaykpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG91dHJvaW5nLmFkZChibG9jayk7XG4gICAgICAgIG91dHJvcy5jLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChkZXRhY2gpXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmQoMSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJsb2NrLm8obG9jYWwpO1xuICAgIH1cbn1cbmNvbnN0IG51bGxfdHJhbnNpdGlvbiA9IHsgZHVyYXRpb246IDAgfTtcbmZ1bmN0aW9uIGNyZWF0ZV9pbl90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IGZhbHNlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBsZXQgdGFzaztcbiAgICBsZXQgdWlkID0gMDtcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKCkge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzLCB1aWQrKyk7XG4gICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgaWYgKHRhc2spXG4gICAgICAgICAgICB0YXNrLmFib3J0KCk7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIHRydWUsICdzdGFydCcpKTtcbiAgICAgICAgdGFzayA9IGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBlbmRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCB0cnVlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQoKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlKTtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oZ28pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBjb25zdCBncm91cCA9IG91dHJvcztcbiAgICBncm91cC5yICs9IDE7XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDEsIDAsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdzdGFydCcpKTtcbiAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIGZhbHNlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghLS1ncm91cC5yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgcmVzdWx0IGluIGBlbmQoKWAgYmVpbmcgY2FsbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgbmVlZCB0byBjbGVhbiB1cCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKGdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEgLSB0LCB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnbygpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBlbmQocmVzZXQpIHtcbiAgICAgICAgICAgIGlmIChyZXNldCAmJiBjb25maWcudGljaykge1xuICAgICAgICAgICAgICAgIGNvbmZpZy50aWNrKDEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zLCBpbnRybykge1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMpO1xuICAgIGxldCB0ID0gaW50cm8gPyAwIDogMTtcbiAgICBsZXQgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWUgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGNsZWFyX2FuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbml0KHByb2dyYW0sIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGQgPSBwcm9ncmFtLmIgLSB0O1xuICAgICAgICBkdXJhdGlvbiAqPSBNYXRoLmFicyhkKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGE6IHQsXG4gICAgICAgICAgICBiOiBwcm9ncmFtLmIsXG4gICAgICAgICAgICBkLFxuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICBzdGFydDogcHJvZ3JhbS5zdGFydCxcbiAgICAgICAgICAgIGVuZDogcHJvZ3JhbS5zdGFydCArIGR1cmF0aW9uLFxuICAgICAgICAgICAgZ3JvdXA6IHByb2dyYW0uZ3JvdXBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ28oYikge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBjb25zdCBwcm9ncmFtID0ge1xuICAgICAgICAgICAgc3RhcnQ6IG5vdygpICsgZGVsYXksXG4gICAgICAgICAgICBiXG4gICAgICAgIH07XG4gICAgICAgIGlmICghYikge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIHByb2dyYW0uZ3JvdXAgPSBvdXRyb3M7XG4gICAgICAgICAgICBvdXRyb3MuciArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0gfHwgcGVuZGluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICBwZW5kaW5nX3Byb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhpcyBpcyBhbiBpbnRybywgYW5kIHRoZXJlJ3MgYSBkZWxheSwgd2UgbmVlZCB0byBkb1xuICAgICAgICAgICAgLy8gYW4gaW5pdGlhbCB0aWNrIGFuZC9vciBhcHBseSBDU1MgYW5pbWF0aW9uIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCB0LCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiKVxuICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBpbml0KHByb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgYiwgJ3N0YXJ0JykpO1xuICAgICAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwZW5kaW5nX3Byb2dyYW0gJiYgbm93ID4gcGVuZGluZ19wcm9ncmFtLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocGVuZGluZ19wcm9ncmFtLCBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnc3RhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIHJ1bm5pbmdfcHJvZ3JhbS5iLCBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24sIDAsIGVhc2luZywgY29uZmlnLmNzcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2sodCA9IHJ1bm5pbmdfcHJvZ3JhbS5iLCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCBydW5uaW5nX3Byb2dyYW0uYiwgJ2VuZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwZW5kaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkb25lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbS5iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGludHJvIOKAlCB3ZSBjYW4gdGlkeSB1cCBpbW1lZGlhdGVseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG91dHJvIOKAlCBuZWVkcyB0byBiZSBjb29yZGluYXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIS0tcnVubmluZ19wcm9ncmFtLmdyb3VwLnIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKHJ1bm5pbmdfcHJvZ3JhbS5ncm91cC5jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vdyA+PSBydW5uaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBub3cgLSBydW5uaW5nX3Byb2dyYW0uc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ID0gcnVubmluZ19wcm9ncmFtLmEgKyBydW5uaW5nX3Byb2dyYW0uZCAqIGVhc2luZyhwIC8gcnVubmluZ19wcm9ncmFtLmR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2sodCwgMSAtIHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhIShydW5uaW5nX3Byb2dyYW0gfHwgcGVuZGluZ19wcm9ncmFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHJ1bihiKSB7XG4gICAgICAgICAgICBpZiAoaXNfZnVuY3Rpb24oY29uZmlnKSkge1xuICAgICAgICAgICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgZ28oYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlX3Byb21pc2UocHJvbWlzZSwgaW5mbykge1xuICAgIGNvbnN0IHRva2VuID0gaW5mby50b2tlbiA9IHt9O1xuICAgIGZ1bmN0aW9uIHVwZGF0ZSh0eXBlLCBpbmRleCwga2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoaW5mby50b2tlbiAhPT0gdG9rZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSB2YWx1ZTtcbiAgICAgICAgbGV0IGNoaWxkX2N0eCA9IGluZm8uY3R4O1xuICAgICAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoaWxkX2N0eCA9IGNoaWxkX2N0eC5zbGljZSgpO1xuICAgICAgICAgICAgY2hpbGRfY3R4W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBibG9jayA9IHR5cGUgJiYgKGluZm8uY3VycmVudCA9IHR5cGUpKGNoaWxkX2N0eCk7XG4gICAgICAgIGxldCBuZWVkc19mbHVzaCA9IGZhbHNlO1xuICAgICAgICBpZiAoaW5mby5ibG9jaykge1xuICAgICAgICAgICAgaWYgKGluZm8uYmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgaW5mby5ibG9ja3MuZm9yRWFjaCgoYmxvY2ssIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGluZGV4ICYmIGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cF9vdXRyb3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5ibG9ja3NbaV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja19vdXRyb3MoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5mby5ibG9jay5kKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmxvY2suYygpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihibG9jaywgMSk7XG4gICAgICAgICAgICBibG9jay5tKGluZm8ubW91bnQoKSwgaW5mby5hbmNob3IpO1xuICAgICAgICAgICAgbmVlZHNfZmx1c2ggPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8uYmxvY2sgPSBibG9jaztcbiAgICAgICAgaWYgKGluZm8uYmxvY2tzKVxuICAgICAgICAgICAgaW5mby5ibG9ja3NbaW5kZXhdID0gYmxvY2s7XG4gICAgICAgIGlmIChuZWVkc19mbHVzaCkge1xuICAgICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNfcHJvbWlzZShwcm9taXNlKSkge1xuICAgICAgICBjb25zdCBjdXJyZW50X2NvbXBvbmVudCA9IGdldF9jdXJyZW50X2NvbXBvbmVudCgpO1xuICAgICAgICBwcm9taXNlLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGN1cnJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnRoZW4sIDEsIGluZm8udmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGN1cnJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLmNhdGNoLCAyLCBpbmZvLmVycm9yLCBlcnJvcik7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgICAgICBpZiAoIWluZm8uaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGlmIHdlIHByZXZpb3VzbHkgaGFkIGEgdGhlbi9jYXRjaCBibG9jaywgZGVzdHJveSBpdFxuICAgICAgICBpZiAoaW5mby5jdXJyZW50ICE9PSBpbmZvLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnBlbmRpbmcsIDApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8udGhlbikge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvLnJlc29sdmVkID0gcHJvbWlzZTtcbiAgICB9XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gZ2xvYmFsVGhpc1xuICAgICAgICA6IGdsb2JhbCk7XG5cbmZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmQoMSk7XG4gICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xufVxuZnVuY3Rpb24gb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiB1cGRhdGVfa2V5ZWRfZWFjaChvbGRfYmxvY2tzLCBkaXJ0eSwgZ2V0X2tleSwgZHluYW1pYywgY3R4LCBsaXN0LCBsb29rdXAsIG5vZGUsIGRlc3Ryb3ksIGNyZWF0ZV9lYWNoX2Jsb2NrLCBuZXh0LCBnZXRfY29udGV4dCkge1xuICAgIGxldCBvID0gb2xkX2Jsb2Nrcy5sZW5ndGg7XG4gICAgbGV0IG4gPSBsaXN0Lmxlbmd0aDtcbiAgICBsZXQgaSA9IG87XG4gICAgY29uc3Qgb2xkX2luZGV4ZXMgPSB7fTtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBvbGRfaW5kZXhlc1tvbGRfYmxvY2tzW2ldLmtleV0gPSBpO1xuICAgIGNvbnN0IG5ld19ibG9ja3MgPSBbXTtcbiAgICBjb25zdCBuZXdfbG9va3VwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGRlbHRhcyA9IG5ldyBNYXAoKTtcbiAgICBpID0gbjtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkX2N0eCA9IGdldF9jb250ZXh0KGN0eCwgbGlzdCwgaSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IGJsb2NrID0gbG9va3VwLmdldChrZXkpO1xuICAgICAgICBpZiAoIWJsb2NrKSB7XG4gICAgICAgICAgICBibG9jayA9IGNyZWF0ZV9lYWNoX2Jsb2NrKGtleSwgY2hpbGRfY3R4KTtcbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkeW5hbWljKSB7XG4gICAgICAgICAgICBibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpO1xuICAgICAgICB9XG4gICAgICAgIG5ld19sb29rdXAuc2V0KGtleSwgbmV3X2Jsb2Nrc1tpXSA9IGJsb2NrKTtcbiAgICAgICAgaWYgKGtleSBpbiBvbGRfaW5kZXhlcylcbiAgICAgICAgICAgIGRlbHRhcy5zZXQoa2V5LCBNYXRoLmFicyhpIC0gb2xkX2luZGV4ZXNba2V5XSkpO1xuICAgIH1cbiAgICBjb25zdCB3aWxsX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgZGlkX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gaW5zZXJ0KGJsb2NrKSB7XG4gICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICBibG9jay5tKG5vZGUsIG5leHQpO1xuICAgICAgICBsb29rdXAuc2V0KGJsb2NrLmtleSwgYmxvY2spO1xuICAgICAgICBuZXh0ID0gYmxvY2suZmlyc3Q7XG4gICAgICAgIG4tLTtcbiAgICB9XG4gICAgd2hpbGUgKG8gJiYgbikge1xuICAgICAgICBjb25zdCBuZXdfYmxvY2sgPSBuZXdfYmxvY2tzW24gLSAxXTtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvIC0gMV07XG4gICAgICAgIGNvbnN0IG5ld19rZXkgPSBuZXdfYmxvY2sua2V5O1xuICAgICAgICBjb25zdCBvbGRfa2V5ID0gb2xkX2Jsb2NrLmtleTtcbiAgICAgICAgaWYgKG5ld19ibG9jayA9PT0gb2xkX2Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBuZXh0ID0gbmV3X2Jsb2NrLmZpcnN0O1xuICAgICAgICAgICAgby0tO1xuICAgICAgICAgICAgbi0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIG9sZCBibG9ja1xuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWxvb2t1cC5oYXMobmV3X2tleSkgfHwgd2lsbF9tb3ZlLmhhcyhuZXdfa2V5KSkge1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlkX21vdmUuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVsdGFzLmdldChuZXdfa2V5KSA+IGRlbHRhcy5nZXQob2xkX2tleSkpIHtcbiAgICAgICAgICAgIGRpZF9tb3ZlLmFkZChuZXdfa2V5KTtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2lsbF9tb3ZlLmFkZChvbGRfa2V5KTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoby0tKSB7XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3Nbb107XG4gICAgICAgIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2Jsb2NrLmtleSkpXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICB9XG4gICAgd2hpbGUgKG4pXG4gICAgICAgIGluc2VydChuZXdfYmxvY2tzW24gLSAxXSk7XG4gICAgcmV0dXJuIG5ld19ibG9ja3M7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2tleXMoY3R4LCBsaXN0LCBnZXRfY29udGV4dCwgZ2V0X2tleSkge1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKSk7XG4gICAgICAgIGlmIChrZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIGR1cGxpY2F0ZSBrZXlzIGluIGEga2V5ZWQgZWFjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRfc3ByZWFkX3VwZGF0ZShsZXZlbHMsIHVwZGF0ZXMpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICBjb25zdCB0b19udWxsX291dCA9IHt9O1xuICAgIGNvbnN0IGFjY291bnRlZF9mb3IgPSB7ICQkc2NvcGU6IDEgfTtcbiAgICBsZXQgaSA9IGxldmVscy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBvID0gbGV2ZWxzW2ldO1xuICAgICAgICBjb25zdCBuID0gdXBkYXRlc1tpXTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gbikpXG4gICAgICAgICAgICAgICAgICAgIHRvX251bGxfb3V0W2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbikge1xuICAgICAgICAgICAgICAgIGlmICghYWNjb3VudGVkX2ZvcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gbltrZXldO1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsc1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0b19udWxsX291dCkge1xuICAgICAgICBpZiAoIShrZXkgaW4gdXBkYXRlKSlcbiAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlO1xufVxuZnVuY3Rpb24gZ2V0X3NwcmVhZF9vYmplY3Qoc3ByZWFkX3Byb3BzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzcHJlYWRfcHJvcHMgPT09ICdvYmplY3QnICYmIHNwcmVhZF9wcm9wcyAhPT0gbnVsbCA/IHNwcmVhZF9wcm9wcyA6IHt9O1xufVxuXG4vLyBzb3VyY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZGljZXMuaHRtbFxuY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbXG4gICAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICAgJ2FsbG93cGF5bWVudHJlcXVlc3QnLFxuICAgICdhc3luYycsXG4gICAgJ2F1dG9mb2N1cycsXG4gICAgJ2F1dG9wbGF5JyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ2NvbnRyb2xzJyxcbiAgICAnZGVmYXVsdCcsXG4gICAgJ2RlZmVyJyxcbiAgICAnZGlzYWJsZWQnLFxuICAgICdmb3Jtbm92YWxpZGF0ZScsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2lzbWFwJyxcbiAgICAnbG9vcCcsXG4gICAgJ211bHRpcGxlJyxcbiAgICAnbXV0ZWQnLFxuICAgICdub21vZHVsZScsXG4gICAgJ25vdmFsaWRhdGUnLFxuICAgICdvcGVuJyxcbiAgICAncGxheXNpbmxpbmUnLFxuICAgICdyZWFkb25seScsXG4gICAgJ3JlcXVpcmVkJyxcbiAgICAncmV2ZXJzZWQnLFxuICAgICdzZWxlY3RlZCdcbl0pO1xuXG5jb25zdCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciA9IC9bXFxzJ1wiPi89XFx1e0ZERDB9LVxcdXtGREVGfVxcdXtGRkZFfVxcdXtGRkZGfVxcdXsxRkZGRX1cXHV7MUZGRkZ9XFx1ezJGRkZFfVxcdXsyRkZGRn1cXHV7M0ZGRkV9XFx1ezNGRkZGfVxcdXs0RkZGRX1cXHV7NEZGRkZ9XFx1ezVGRkZFfVxcdXs1RkZGRn1cXHV7NkZGRkV9XFx1ezZGRkZGfVxcdXs3RkZGRX1cXHV7N0ZGRkZ9XFx1ezhGRkZFfVxcdXs4RkZGRn1cXHV7OUZGRkV9XFx1ezlGRkZGfVxcdXtBRkZGRX1cXHV7QUZGRkZ9XFx1e0JGRkZFfVxcdXtCRkZGRn1cXHV7Q0ZGRkV9XFx1e0NGRkZGfVxcdXtERkZGRX1cXHV7REZGRkZ9XFx1e0VGRkZFfVxcdXtFRkZGRn1cXHV7RkZGRkV9XFx1e0ZGRkZGfVxcdXsxMEZGRkV9XFx1ezEwRkZGRn1dL3U7XG4vLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGVzLTJcbi8vIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNub25jaGFyYWN0ZXJcbmZ1bmN0aW9uIHNwcmVhZChhcmdzLCBjbGFzc2VzX3RvX2FkZCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5hcmdzKTtcbiAgICBpZiAoY2xhc3Nlc190b19hZGQpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuY2xhc3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyArPSAnICcgKyBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3RyID0gJyc7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLnRlc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciArPSBgICR7bmFtZX09XCIke1N0cmluZyh2YWx1ZSkucmVwbGFjZSgvXCIvZywgJyYjMzQ7JykucmVwbGFjZSgvJy9nLCAnJiMzOTsnKX1cImA7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgZXNjYXBlZCA9IHtcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0Oydcbn07XG5mdW5jdGlvbiBlc2NhcGUoaHRtbCkge1xuICAgIHJldHVybiBTdHJpbmcoaHRtbCkucmVwbGFjZSgvW1wiJyY8Pl0vZywgbWF0Y2ggPT4gZXNjYXBlZFttYXRjaF0pO1xufVxuZnVuY3Rpb24gZWFjaChpdGVtcywgZm4pIHtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdHIgKz0gZm4oaXRlbXNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgbWlzc2luZ19jb21wb25lbnQgPSB7XG4gICAgJCRyZW5kZXI6ICgpID0+ICcnXG59O1xuZnVuY3Rpb24gdmFsaWRhdGVfY29tcG9uZW50KGNvbXBvbmVudCwgbmFtZSkge1xuICAgIGlmICghY29tcG9uZW50IHx8ICFjb21wb25lbnQuJCRyZW5kZXIpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdzdmVsdGU6Y29tcG9uZW50JylcbiAgICAgICAgICAgIG5hbWUgKz0gJyB0aGlzPXsuLi59JztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8JHtuYW1lfT4gaXMgbm90IGEgdmFsaWQgU1NSIGNvbXBvbmVudC4gWW91IG1heSBuZWVkIHRvIHJldmlldyB5b3VyIGJ1aWxkIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBkZXBlbmRlbmNpZXMgYXJlIGNvbXBpbGVkLCByYXRoZXIgdGhhbiBpbXBvcnRlZCBhcyBwcmUtY29tcGlsZWQgbW9kdWxlc2ApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZGVidWcoZmlsZSwgbGluZSwgY29sdW1uLCB2YWx1ZXMpIHtcbiAgICBjb25zb2xlLmxvZyhge0BkZWJ1Z30gJHtmaWxlID8gZmlsZSArICcgJyA6ICcnfSgke2xpbmV9OiR7Y29sdW1ufSlgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2codmFsdWVzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgcmV0dXJuICcnO1xufVxubGV0IG9uX2Rlc3Ryb3k7XG5mdW5jdGlvbiBjcmVhdGVfc3NyX2NvbXBvbmVudChmbikge1xuICAgIGZ1bmN0aW9uICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cykge1xuICAgICAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgICAgIGNvbnN0ICQkID0ge1xuICAgICAgICAgICAgb25fZGVzdHJveSxcbiAgICAgICAgICAgIGNvbnRleHQ6IG5ldyBNYXAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSxcbiAgICAgICAgICAgIC8vIHRoZXNlIHdpbGwgYmUgaW1tZWRpYXRlbHkgZGlzY2FyZGVkXG4gICAgICAgICAgICBvbl9tb3VudDogW10sXG4gICAgICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGFmdGVyX3VwZGF0ZTogW10sXG4gICAgICAgICAgICBjYWxsYmFja3M6IGJsYW5rX29iamVjdCgpXG4gICAgICAgIH07XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudCh7ICQkIH0pO1xuICAgICAgICBjb25zdCBodG1sID0gZm4ocmVzdWx0LCBwcm9wcywgYmluZGluZ3MsIHNsb3RzKTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyOiAocHJvcHMgPSB7fSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgICAgICAgICBvbl9kZXN0cm95ID0gW107XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7IHRpdGxlOiAnJywgaGVhZDogJycsIGNzczogbmV3IFNldCgpIH07XG4gICAgICAgICAgICBjb25zdCBodG1sID0gJCRyZW5kZXIocmVzdWx0LCBwcm9wcywge30sIG9wdGlvbnMpO1xuICAgICAgICAgICAgcnVuX2FsbChvbl9kZXN0cm95KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaHRtbCxcbiAgICAgICAgICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogQXJyYXkuZnJvbShyZXN1bHQuY3NzKS5tYXAoY3NzID0+IGNzcy5jb2RlKS5qb2luKCdcXG4nKSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBudWxsIC8vIFRPRE9cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGhlYWQ6IHJlc3VsdC50aXRsZSArIHJlc3VsdC5oZWFkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAkJHJlbmRlclxuICAgIH07XG59XG5mdW5jdGlvbiBhZGRfYXR0cmlidXRlKG5hbWUsIHZhbHVlLCBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwgfHwgKGJvb2xlYW4gJiYgIXZhbHVlKSlcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIHJldHVybiBgICR7bmFtZX0ke3ZhbHVlID09PSB0cnVlID8gJycgOiBgPSR7dHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04uc3RyaW5naWZ5KGVzY2FwZSh2YWx1ZSkpIDogYFwiJHt2YWx1ZX1cImB9YH1gO1xufVxuZnVuY3Rpb24gYWRkX2NsYXNzZXMoY2xhc3Nlcykge1xuICAgIHJldHVybiBjbGFzc2VzID8gYCBjbGFzcz1cIiR7Y2xhc3Nlc31cImAgOiAnJztcbn1cblxuZnVuY3Rpb24gYmluZChjb21wb25lbnQsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaW5kZXggPSBjb21wb25lbnQuJCQucHJvcHNbbmFtZV07XG4gICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcG9uZW50LiQkLmJvdW5kW2luZGV4XSA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayhjb21wb25lbnQuJCQuY3R4W2luZGV4XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlX2NvbXBvbmVudChibG9jaykge1xuICAgIGJsb2NrICYmIGJsb2NrLmMoKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2NvbXBvbmVudChibG9jaywgcGFyZW50X25vZGVzKSB7XG4gICAgYmxvY2sgJiYgYmxvY2subChwYXJlbnRfbm9kZXMpO1xufVxuZnVuY3Rpb24gbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgdGFyZ2V0LCBhbmNob3IpIHtcbiAgICBjb25zdCB7IGZyYWdtZW50LCBvbl9tb3VudCwgb25fZGVzdHJveSwgYWZ0ZXJfdXBkYXRlIH0gPSBjb21wb25lbnQuJCQ7XG4gICAgZnJhZ21lbnQgJiYgZnJhZ21lbnQubSh0YXJnZXQsIGFuY2hvcik7XG4gICAgLy8gb25Nb3VudCBoYXBwZW5zIGJlZm9yZSB0aGUgaW5pdGlhbCBhZnRlclVwZGF0ZVxuICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdfb25fZGVzdHJveSA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgIGlmIChvbl9kZXN0cm95KSB7XG4gICAgICAgICAgICBvbl9kZXN0cm95LnB1c2goLi4ubmV3X29uX2Rlc3Ryb3kpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gRWRnZSBjYXNlIC0gY29tcG9uZW50IHdhcyBkZXN0cm95ZWQgaW1tZWRpYXRlbHksXG4gICAgICAgICAgICAvLyBtb3N0IGxpa2VseSBhcyBhIHJlc3VsdCBvZiBhIGJpbmRpbmcgaW5pdGlhbGlzaW5nXG4gICAgICAgICAgICBydW5fYWxsKG5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnQuJCQub25fbW91bnQgPSBbXTtcbiAgICB9KTtcbiAgICBhZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3lfY29tcG9uZW50KGNvbXBvbmVudCwgZGV0YWNoaW5nKSB7XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQ7XG4gICAgaWYgKCQkLmZyYWdtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHJ1bl9hbGwoJCQub25fZGVzdHJveSk7XG4gICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LmQoZGV0YWNoaW5nKTtcbiAgICAgICAgLy8gVE9ETyBudWxsIG91dCBvdGhlciByZWZzLCBpbmNsdWRpbmcgY29tcG9uZW50LiQkIChidXQgbmVlZCB0b1xuICAgICAgICAvLyBwcmVzZXJ2ZSBmaW5hbCBzdGF0ZT8pXG4gICAgICAgICQkLm9uX2Rlc3Ryb3kgPSAkJC5mcmFnbWVudCA9IG51bGw7XG4gICAgICAgICQkLmN0eCA9IFtdO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1ha2VfZGlydHkoY29tcG9uZW50LCBpKSB7XG4gICAgaWYgKGNvbXBvbmVudC4kJC5kaXJ0eVswXSA9PT0gLTEpIHtcbiAgICAgICAgZGlydHlfY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgICAgICBjb21wb25lbnQuJCQuZGlydHkuZmlsbCgwKTtcbiAgICB9XG4gICAgY29tcG9uZW50LiQkLmRpcnR5WyhpIC8gMzEpIHwgMF0gfD0gKDEgPDwgKGkgJSAzMSkpO1xufVxuZnVuY3Rpb24gaW5pdChjb21wb25lbnQsIG9wdGlvbnMsIGluc3RhbmNlLCBjcmVhdGVfZnJhZ21lbnQsIG5vdF9lcXVhbCwgcHJvcHMsIGRpcnR5ID0gWy0xXSkge1xuICAgIGNvbnN0IHBhcmVudF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcbiAgICBjb25zdCBwcm9wX3ZhbHVlcyA9IG9wdGlvbnMucHJvcHMgfHwge307XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQgPSB7XG4gICAgICAgIGZyYWdtZW50OiBudWxsLFxuICAgICAgICBjdHg6IG51bGwsXG4gICAgICAgIC8vIHN0YXRlXG4gICAgICAgIHByb3BzLFxuICAgICAgICB1cGRhdGU6IG5vb3AsXG4gICAgICAgIG5vdF9lcXVhbCxcbiAgICAgICAgYm91bmQ6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICAvLyBsaWZlY3ljbGVcbiAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICBvbl9kZXN0cm95OiBbXSxcbiAgICAgICAgYmVmb3JlX3VwZGF0ZTogW10sXG4gICAgICAgIGFmdGVyX3VwZGF0ZTogW10sXG4gICAgICAgIGNvbnRleHQ6IG5ldyBNYXAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSxcbiAgICAgICAgLy8gZXZlcnl0aGluZyBlbHNlXG4gICAgICAgIGNhbGxiYWNrczogYmxhbmtfb2JqZWN0KCksXG4gICAgICAgIGRpcnR5LFxuICAgICAgICBza2lwX2JvdW5kOiBmYWxzZVxuICAgIH07XG4gICAgbGV0IHJlYWR5ID0gZmFsc2U7XG4gICAgJCQuY3R4ID0gaW5zdGFuY2VcbiAgICAgICAgPyBpbnN0YW5jZShjb21wb25lbnQsIHByb3BfdmFsdWVzLCAoaSwgcmV0LCAuLi5yZXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlc3QubGVuZ3RoID8gcmVzdFswXSA6IHJldDtcbiAgICAgICAgICAgIGlmICgkJC5jdHggJiYgbm90X2VxdWFsKCQkLmN0eFtpXSwgJCQuY3R4W2ldID0gdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkJC5za2lwX2JvdW5kICYmICQkLmJvdW5kW2ldKVxuICAgICAgICAgICAgICAgICAgICAkJC5ib3VuZFtpXSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KVxuICAgICAgICAgICAgICAgICAgICBtYWtlX2RpcnR5KGNvbXBvbmVudCwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9KVxuICAgICAgICA6IFtdO1xuICAgICQkLnVwZGF0ZSgpO1xuICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICBydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuICAgIC8vIGBmYWxzZWAgYXMgYSBzcGVjaWFsIGNhc2Ugb2Ygbm8gRE9NIGNvbXBvbmVudFxuICAgICQkLmZyYWdtZW50ID0gY3JlYXRlX2ZyYWdtZW50ID8gY3JlYXRlX2ZyYWdtZW50KCQkLmN0eCkgOiBmYWxzZTtcbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaHlkcmF0ZSkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjaGlsZHJlbihvcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQubChub2Rlcyk7XG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGRldGFjaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuYygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmludHJvKVxuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihjb21wb25lbnQuJCQuZnJhZ21lbnQpO1xuICAgICAgICBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IpO1xuICAgICAgICBmbHVzaCgpO1xuICAgIH1cbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG59XG5sZXQgU3ZlbHRlRWxlbWVudDtcbmlmICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBTdmVsdGVFbGVtZW50ID0gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuJCQuc2xvdHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLiQkLnNsb3R0ZWRba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIF9vbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXNbYXR0cl0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUT0RPIHNob3VsZCB0aGlzIGRlbGVnYXRlIHRvIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICB9XG4gICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSB8fCAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gPSBbXSkpO1xuICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICBpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkoJCRwcm9wcykpIHtcbiAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoX2Rldih0eXBlLCBkZXRhaWwpIHtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudCh0eXBlLCBPYmplY3QuYXNzaWduKHsgdmVyc2lvbjogJzMuMjkuNCcgfSwgZGV0YWlsKSkpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZCh0YXJnZXQsIG5vZGUpO1xufVxuZnVuY3Rpb24gaW5zZXJ0X2Rldih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUsIGFuY2hvciB9KTtcbiAgICBpbnNlcnQodGFyZ2V0LCBub2RlLCBhbmNob3IpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2Rldihub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmUnLCB7IG5vZGUgfSk7XG4gICAgZGV0YWNoKG5vZGUpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2JldHdlZW5fZGV2KGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nICYmIGJlZm9yZS5uZXh0U2libGluZyAhPT0gYWZ0ZXIpIHtcbiAgICAgICAgZGV0YWNoX2RldihiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9iZWZvcmVfZGV2KGFmdGVyKSB7XG4gICAgd2hpbGUgKGFmdGVyLnByZXZpb3VzU2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGFmdGVyLnByZXZpb3VzU2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoX2FmdGVyX2RldihiZWZvcmUpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsaXN0ZW5fZGV2KG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zLCBoYXNfcHJldmVudF9kZWZhdWx0LCBoYXNfc3RvcF9wcm9wYWdhdGlvbikge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IG9wdGlvbnMgPT09IHRydWUgPyBbJ2NhcHR1cmUnXSA6IG9wdGlvbnMgPyBBcnJheS5mcm9tKE9iamVjdC5rZXlzKG9wdGlvbnMpKSA6IFtdO1xuICAgIGlmIChoYXNfcHJldmVudF9kZWZhdWx0KVxuICAgICAgICBtb2RpZmllcnMucHVzaCgncHJldmVudERlZmF1bHQnKTtcbiAgICBpZiAoaGFzX3N0b3BfcHJvcGFnYXRpb24pXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdzdG9wUHJvcGFnYXRpb24nKTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUFkZEV2ZW50TGlzdGVuZXInLCB7IG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBtb2RpZmllcnMgfSk7XG4gICAgY29uc3QgZGlzcG9zZSA9IGxpc3Rlbihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHJfZGV2KG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZUF0dHJpYnV0ZScsIHsgbm9kZSwgYXR0cmlidXRlIH0pO1xuICAgIGVsc2VcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXRBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBwcm9wX2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0UHJvcGVydHknLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIGRhdGFzZXRfZGV2KG5vZGUsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIG5vZGUuZGF0YXNldFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGFzZXQnLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhX2Rldih0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgPT09IGRhdGEpXG4gICAgICAgIHJldHVybjtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGEnLCB7IG5vZGU6IHRleHQsIGRhdGEgfSk7XG4gICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2VhY2hfYXJndW1lbnQoYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnICYmICEoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmICdsZW5ndGgnIGluIGFyZykpIHtcbiAgICAgICAgbGV0IG1zZyA9ICd7I2VhY2h9IG9ubHkgaXRlcmF0ZXMgb3ZlciBhcnJheS1saWtlIG9iamVjdHMuJztcbiAgICAgICAgaWYgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgYXJnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBhcmcpIHtcbiAgICAgICAgICAgIG1zZyArPSAnIFlvdSBjYW4gdXNlIGEgc3ByZWFkIHRvIGNvbnZlcnQgdGhpcyBpdGVyYWJsZSBpbnRvIGFuIGFycmF5Lic7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVfc2xvdHMobmFtZSwgc2xvdCwga2V5cykge1xuICAgIGZvciAoY29uc3Qgc2xvdF9rZXkgb2YgT2JqZWN0LmtleXMoc2xvdCkpIHtcbiAgICAgICAgaWYgKCF+a2V5cy5pbmRleE9mKHNsb3Rfa2V5KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGA8JHtuYW1lfT4gcmVjZWl2ZWQgYW4gdW5leHBlY3RlZCBzbG90IFwiJHtzbG90X2tleX1cIi5gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudERldiBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMgfHwgKCFvcHRpb25zLnRhcmdldCAmJiAhb3B0aW9ucy4kJGlubGluZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIid0YXJnZXQnIGlzIGEgcmVxdWlyZWQgb3B0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgICRkZXN0cm95KCkge1xuICAgICAgICBzdXBlci4kZGVzdHJveSgpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb21wb25lbnQgd2FzIGFscmVhZHkgZGVzdHJveWVkJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAkY2FwdHVyZV9zdGF0ZSgpIHsgfVxuICAgICRpbmplY3Rfc3RhdGUoKSB7IH1cbn1cbmZ1bmN0aW9uIGxvb3BfZ3VhcmQodGltZW91dCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gdGltZW91dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIGRldGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgeyBIdG1sVGFnLCBTdmVsdGVDb21wb25lbnQsIFN2ZWx0ZUNvbXBvbmVudERldiwgU3ZlbHRlRWxlbWVudCwgYWN0aW9uX2Rlc3Ryb3llciwgYWRkX2F0dHJpYnV0ZSwgYWRkX2NsYXNzZXMsIGFkZF9mbHVzaF9jYWxsYmFjaywgYWRkX2xvY2F0aW9uLCBhZGRfcmVuZGVyX2NhbGxiYWNrLCBhZGRfcmVzaXplX2xpc3RlbmVyLCBhZGRfdHJhbnNmb3JtLCBhZnRlclVwZGF0ZSwgYXBwZW5kLCBhcHBlbmRfZGV2LCBhc3NpZ24sIGF0dHIsIGF0dHJfZGV2LCBiZWZvcmVVcGRhdGUsIGJpbmQsIGJpbmRpbmdfY2FsbGJhY2tzLCBibGFua19vYmplY3QsIGJ1YmJsZSwgY2hlY2tfb3V0cm9zLCBjaGlsZHJlbiwgY2xhaW1fY29tcG9uZW50LCBjbGFpbV9lbGVtZW50LCBjbGFpbV9zcGFjZSwgY2xhaW1fdGV4dCwgY2xlYXJfbG9vcHMsIGNvbXBvbmVudF9zdWJzY3JpYmUsIGNvbXB1dGVfcmVzdF9wcm9wcywgY29tcHV0ZV9zbG90cywgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBjcmVhdGVfYW5pbWF0aW9uLCBjcmVhdGVfYmlkaXJlY3Rpb25hbF90cmFuc2l0aW9uLCBjcmVhdGVfY29tcG9uZW50LCBjcmVhdGVfaW5fdHJhbnNpdGlvbiwgY3JlYXRlX291dF90cmFuc2l0aW9uLCBjcmVhdGVfc2xvdCwgY3JlYXRlX3Nzcl9jb21wb25lbnQsIGN1cnJlbnRfY29tcG9uZW50LCBjdXN0b21fZXZlbnQsIGRhdGFzZXRfZGV2LCBkZWJ1ZywgZGVzdHJveV9ibG9jaywgZGVzdHJveV9jb21wb25lbnQsIGRlc3Ryb3lfZWFjaCwgZGV0YWNoLCBkZXRhY2hfYWZ0ZXJfZGV2LCBkZXRhY2hfYmVmb3JlX2RldiwgZGV0YWNoX2JldHdlZW5fZGV2LCBkZXRhY2hfZGV2LCBkaXJ0eV9jb21wb25lbnRzLCBkaXNwYXRjaF9kZXYsIGVhY2gsIGVsZW1lbnQsIGVsZW1lbnRfaXMsIGVtcHR5LCBlc2NhcGUsIGVzY2FwZWQsIGV4Y2x1ZGVfaW50ZXJuYWxfcHJvcHMsIGZpeF9hbmRfZGVzdHJveV9ibG9jaywgZml4X2FuZF9vdXRyb19hbmRfZGVzdHJveV9ibG9jaywgZml4X3Bvc2l0aW9uLCBmbHVzaCwgZ2V0Q29udGV4dCwgZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUsIGdldF9jdXJyZW50X2NvbXBvbmVudCwgZ2V0X3Nsb3RfY2hhbmdlcywgZ2V0X3Nsb3RfY29udGV4dCwgZ2V0X3NwcmVhZF9vYmplY3QsIGdldF9zcHJlYWRfdXBkYXRlLCBnZXRfc3RvcmVfdmFsdWUsIGdsb2JhbHMsIGdyb3VwX291dHJvcywgaGFuZGxlX3Byb21pc2UsIGhhc19wcm9wLCBpZGVudGl0eSwgaW5pdCwgaW5zZXJ0LCBpbnNlcnRfZGV2LCBpbnRyb3MsIGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLCBpc19jbGllbnQsIGlzX2Nyb3Nzb3JpZ2luLCBpc19lbXB0eSwgaXNfZnVuY3Rpb24sIGlzX3Byb21pc2UsIGxpc3RlbiwgbGlzdGVuX2RldiwgbG9vcCwgbG9vcF9ndWFyZCwgbWlzc2luZ19jb21wb25lbnQsIG1vdW50X2NvbXBvbmVudCwgbm9vcCwgbm90X2VxdWFsLCBub3csIG51bGxfdG9fZW1wdHksIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMsIG9uRGVzdHJveSwgb25Nb3VudCwgb25jZSwgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2ssIHByZXZlbnRfZGVmYXVsdCwgcHJvcF9kZXYsIHF1ZXJ5X3NlbGVjdG9yX2FsbCwgcmFmLCBydW4sIHJ1bl9hbGwsIHNhZmVfbm90X2VxdWFsLCBzY2hlZHVsZV91cGRhdGUsIHNlbGVjdF9tdWx0aXBsZV92YWx1ZSwgc2VsZWN0X29wdGlvbiwgc2VsZWN0X29wdGlvbnMsIHNlbGVjdF92YWx1ZSwgc2VsZiwgc2V0Q29udGV4dCwgc2V0X2F0dHJpYnV0ZXMsIHNldF9jdXJyZW50X2NvbXBvbmVudCwgc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEsIHNldF9kYXRhLCBzZXRfZGF0YV9kZXYsIHNldF9pbnB1dF90eXBlLCBzZXRfaW5wdXRfdmFsdWUsIHNldF9ub3csIHNldF9yYWYsIHNldF9zdG9yZV92YWx1ZSwgc2V0X3N0eWxlLCBzZXRfc3ZnX2F0dHJpYnV0ZXMsIHNwYWNlLCBzcHJlYWQsIHN0b3BfcHJvcGFnYXRpb24sIHN1YnNjcmliZSwgc3ZnX2VsZW1lbnQsIHRleHQsIHRpY2ssIHRpbWVfcmFuZ2VzX3RvX2FycmF5LCB0b19udW1iZXIsIHRvZ2dsZV9jbGFzcywgdHJhbnNpdGlvbl9pbiwgdHJhbnNpdGlvbl9vdXQsIHVwZGF0ZV9rZXllZF9lYWNoLCB1cGRhdGVfc2xvdCwgdmFsaWRhdGVfY29tcG9uZW50LCB2YWxpZGF0ZV9lYWNoX2FyZ3VtZW50LCB2YWxpZGF0ZV9lYWNoX2tleXMsIHZhbGlkYXRlX3Nsb3RzLCB2YWxpZGF0ZV9zdG9yZSwgeGxpbmtfYXR0ciB9O1xuIiwiaW1wb3J0IHsgbm9vcCwgc2FmZV9ub3RfZXF1YWwsIHN1YnNjcmliZSwgcnVuX2FsbCwgaXNfZnVuY3Rpb24gfSBmcm9tICcuLi9pbnRlcm5hbCc7XG5leHBvcnQgeyBnZXRfc3RvcmVfdmFsdWUgYXMgZ2V0IH0gZnJvbSAnLi4vaW50ZXJuYWwnO1xuXG5jb25zdCBzdWJzY3JpYmVyX3F1ZXVlID0gW107XG4vKipcbiAqIENyZWF0ZXMgYSBgUmVhZGFibGVgIHN0b3JlIHRoYXQgYWxsb3dzIHJlYWRpbmcgYnkgc3Vic2NyaXB0aW9uLlxuICogQHBhcmFtIHZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXJ9c3RhcnQgc3RhcnQgYW5kIHN0b3Agbm90aWZpY2F0aW9ucyBmb3Igc3Vic2NyaXB0aW9uc1xuICovXG5mdW5jdGlvbiByZWFkYWJsZSh2YWx1ZSwgc3RhcnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmU6IHdyaXRhYmxlKHZhbHVlLCBzdGFydCkuc3Vic2NyaWJlXG4gICAgfTtcbn1cbi8qKlxuICogQ3JlYXRlIGEgYFdyaXRhYmxlYCBzdG9yZSB0aGF0IGFsbG93cyBib3RoIHVwZGF0aW5nIGFuZCByZWFkaW5nIGJ5IHN1YnNjcmlwdGlvbi5cbiAqIEBwYXJhbSB7Kj19dmFsdWUgaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHtTdGFydFN0b3BOb3RpZmllcj19c3RhcnQgc3RhcnQgYW5kIHN0b3Agbm90aWZpY2F0aW9ucyBmb3Igc3Vic2NyaXB0aW9uc1xuICovXG5mdW5jdGlvbiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQgPSBub29wKSB7XG4gICAgbGV0IHN0b3A7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSBbXTtcbiAgICBmdW5jdGlvbiBzZXQobmV3X3ZhbHVlKSB7XG4gICAgICAgIGlmIChzYWZlX25vdF9lcXVhbCh2YWx1ZSwgbmV3X3ZhbHVlKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBuZXdfdmFsdWU7XG4gICAgICAgICAgICBpZiAoc3RvcCkgeyAvLyBzdG9yZSBpcyByZWFkeVxuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bl9xdWV1ZSA9ICFzdWJzY3JpYmVyX3F1ZXVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHMgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgc1sxXSgpO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyX3F1ZXVlLnB1c2gocywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVuX3F1ZXVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZVtpXVswXShzdWJzY3JpYmVyX3F1ZXVlW2kgKyAxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGUoZm4pIHtcbiAgICAgICAgc2V0KGZuKHZhbHVlKSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZShydW4sIGludmFsaWRhdGUgPSBub29wKSB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmliZXIgPSBbcnVuLCBpbnZhbGlkYXRlXTtcbiAgICAgICAgc3Vic2NyaWJlcnMucHVzaChzdWJzY3JpYmVyKTtcbiAgICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgc3RvcCA9IHN0YXJ0KHNldCkgfHwgbm9vcDtcbiAgICAgICAgfVxuICAgICAgICBydW4odmFsdWUpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzdWJzY3JpYmVycy5pbmRleE9mKHN1YnNjcmliZXIpO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIHN0b3AgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4geyBzZXQsIHVwZGF0ZSwgc3Vic2NyaWJlIH07XG59XG5mdW5jdGlvbiBkZXJpdmVkKHN0b3JlcywgZm4sIGluaXRpYWxfdmFsdWUpIHtcbiAgICBjb25zdCBzaW5nbGUgPSAhQXJyYXkuaXNBcnJheShzdG9yZXMpO1xuICAgIGNvbnN0IHN0b3Jlc19hcnJheSA9IHNpbmdsZVxuICAgICAgICA/IFtzdG9yZXNdXG4gICAgICAgIDogc3RvcmVzO1xuICAgIGNvbnN0IGF1dG8gPSBmbi5sZW5ndGggPCAyO1xuICAgIHJldHVybiByZWFkYWJsZShpbml0aWFsX3ZhbHVlLCAoc2V0KSA9PiB7XG4gICAgICAgIGxldCBpbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICAgICAgbGV0IGNsZWFudXAgPSBub29wO1xuICAgICAgICBjb25zdCBzeW5jID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBmbihzaW5nbGUgPyB2YWx1ZXNbMF0gOiB2YWx1ZXMsIHNldCk7XG4gICAgICAgICAgICBpZiAoYXV0bykge1xuICAgICAgICAgICAgICAgIHNldChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xlYW51cCA9IGlzX2Z1bmN0aW9uKHJlc3VsdCkgPyByZXN1bHQgOiBub29wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZXJzID0gc3RvcmVzX2FycmF5Lm1hcCgoc3RvcmUsIGkpID0+IHN1YnNjcmliZShzdG9yZSwgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHBlbmRpbmcgJj0gfigxIDw8IGkpO1xuICAgICAgICAgICAgaWYgKGluaXRlZCkge1xuICAgICAgICAgICAgICAgIHN5bmMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgcGVuZGluZyB8PSAoMSA8PCBpKTtcbiAgICAgICAgfSkpO1xuICAgICAgICBpbml0ZWQgPSB0cnVlO1xuICAgICAgICBzeW5jKCk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgcnVuX2FsbCh1bnN1YnNjcmliZXJzKTtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IHsgZGVyaXZlZCwgcmVhZGFibGUsIHdyaXRhYmxlIH07XG4iLCJpbXBvcnQgeyB3cml0YWJsZSB9IGZyb20gJ3N2ZWx0ZS9zdG9yZSc7XG5cbmV4cG9ydCBjb25zdCBDT05URVhUX0tFWSA9IHt9O1xuXG5leHBvcnQgY29uc3QgcHJlbG9hZCA9ICgpID0+ICh7fSk7IiwiPHNjcmlwdD5cbiAgaW1wb3J0IHsgYWZ0ZXJVcGRhdGUsIG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7XG4gIGV4cG9ydCBsZXQgc2NhbGUgPSBcIk1cIjtcbiAgZXhwb3J0IGxldCBjbGFzc05hbWUgPSBcIlwiO1xuICBleHBvcnQgbGV0IHdpZHRoID0gXCJcIjtcbiAgZXhwb3J0IGxldCBoZWlnaHQgPSBcIlwiO1xuICBleHBvcnQgbGV0IGFyaWFMYWJlbCA9IFwiQWxlcnRNZWRpdW1cIjtcbiAgbGV0IHBhdGg7XG4gIGxldCBzdztcbiAgbGV0IHNoO1xuXG4gIGxldCBmbGFnID0gMTQ7XG4gIG9uTW91bnQoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgfSk7XG5cbiAgYWZ0ZXJVcGRhdGUoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgICBpZiAoIXNjYWxlIHx8IHNjYWxlID09IFwiTVwiKSB7XG4gICAgICBsZXQgcm9vdENsYXNzTmFtZSA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc05hbWU7XG4gICAgICBpZiAocm9vdENsYXNzTmFtZSAmJiByb290Q2xhc3NOYW1lLmluZGV4T2YoXCJzcGVjdHJ1bS0tbGFyZ2VcIikgIT0gLTEpIHtcbiAgICAgICAgc2NhbGUgPSBcIkxcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYWxlID0gXCJNXCI7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbjwvc2NyaXB0PlxuXG5cblxuPHN2Z1xuICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gIHsuLi4kJHJlc3RQcm9wc31cbiAgd2lkdGg9e3dpZHRoIHx8IHN3IHx8IGZsYWd9XG4gIGhlaWdodD17aGVpZ2h0IHx8IHNoIHx8IGZsYWd9XG4gIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICBjbGFzcz1cInNwZWN0cnVtLUljb24ge2NsYXNzTmFtZX1cIj5cbiAgeyNpZiBzY2FsZSA9PT0gJ0wnfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgICBkPVwiTTEwLjU2MyAyLjIwNmwtOS4yNDkgMTYuNTVhLjUuNSAwIDAwLjQzNi43NDRoMTguNWEuNS41IDAgMDAuNDM2LS43NDRsLTkuMjUxLTE2LjU1YS41LjUgMCAwMC0uODcyIDB6bTEuNDM2XG4gICAgICAxNS4wNDRhLjI1LjI1IDAgMDEtLjI1LjI1aC0xLjVhLjI1LjI1IDAgMDEtLjI1LS4yNXYtMS41YS4yNS4yNSAwIDAxLjI1LS4yNWgxLjVhLjI1LjI1IDAgMDEuMjUuMjV6bTAtMy41YS4yNS4yNSAwXG4gICAgICAwMS0uMjUuMjVoLTEuNWEuMjUuMjUgMCAwMS0uMjUtLjI1di02YS4yNS4yNSAwIDAxLjI1LS4yNWgxLjVhLjI1LjI1IDAgMDEuMjUuMjV6XCIgLz5cbiAgezplbHNlIGlmIHNjYWxlID09PSAnTSd9XG4gICAgPHBhdGhcbiAgICAgIGJpbmQ6dGhpcz17cGF0aH1cbiAgICAgIGQ9XCJNOC41NjQgMS4yODlMLjIgMTYuMjU2QS41LjUgMCAwMC42MzYgMTdoMTYuNzI4YS41LjUgMCAwMC40MzYtLjc0NEw5LjQzNiAxLjI4OWEuNS41IDAgMDAtLjg3MiAwek0xMCAxNC43NWEuMjUuMjVcbiAgICAgIDAgMDEtLjI1LjI1aC0xLjVhLjI1LjI1IDAgMDEtLjI1LS4yNXYtMS41YS4yNS4yNSAwIDAxLjI1LS4yNWgxLjVhLjI1LjI1IDAgMDEuMjUuMjV6bTAtM2EuMjUuMjUgMFxuICAgICAgMDEtLjI1LjI1aC0xLjVhLjI1LjI1IDAgMDEtLjI1LS4yNXYtNmEuMjUuMjUgMCAwMS4yNS0uMjVoMS41YS4yNS4yNSAwIDAxLjI1LjI1elwiIC8+XG4gIHsvaWZ9XG48L3N2Zz5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBleHBvcnQgbGV0IHNjYWxlID0gXCJNXCI7XG4gIGV4cG9ydCBsZXQgY2xhc3NOYW1lID0gXCJcIjtcbiAgZXhwb3J0IGxldCB3aWR0aCA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgaGVpZ2h0ID0gXCJcIjtcbiAgZXhwb3J0IGxldCBhcmlhTGFiZWwgPSBcIkNoZWNrbWFya01lZGl1bVwiO1xuICBsZXQgcGF0aDtcbiAgbGV0IHN3O1xuICBsZXQgc2g7XG5cbiAgbGV0IGZsYWcgPSAxNDtcbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICB9KTtcblxuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICAgIGlmICghc2NhbGUgfHwgc2NhbGUgPT0gXCJNXCIpIHtcbiAgICAgIGxldCByb290Q2xhc3NOYW1lID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZTtcbiAgICAgIGlmIChyb290Q2xhc3NOYW1lICYmIHJvb3RDbGFzc05hbWUuaW5kZXhPZihcInNwZWN0cnVtLS1sYXJnZVwiKSAhPSAtMSkge1xuICAgICAgICBzY2FsZSA9IFwiTFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NhbGUgPSBcIk1cIjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuPC9zY3JpcHQ+XG5cblxuXG48c3ZnXG4gIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgey4uLiQkcmVzdFByb3BzfVxuICB3aWR0aD17d2lkdGggfHwgc3cgfHwgZmxhZ31cbiAgaGVpZ2h0PXtoZWlnaHQgfHwgc2ggfHwgZmxhZ31cbiAgZmlsbD1cImN1cnJlbnRDb2xvclwiXG4gIGNsYXNzPVwic3BlY3RydW0tSWNvbiB7Y2xhc3NOYW1lfVwiPlxuICB7I2lmIHNjYWxlID09PSAnTCd9XG4gICAgPHBhdGhcbiAgICAgIGJpbmQ6dGhpcz17cGF0aH1cbiAgICAgIGQ9XCJNNiAxNGExIDEgMCAwMS0uNzg5LS4zODVsLTQtNWExIDEgMCAxMTEuNTc3LTEuMjNMNiAxMS4zNzZsNy4yMTMtOC45OWExIDEgMCAxMTEuNTc2IDEuMjNsLTggMTBhMSAxIDBcbiAgICAgIDAxLS43ODkuMzg0elwiIC8+XG4gIHs6ZWxzZSBpZiBzY2FsZSA9PT0gJ00nfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgICBkPVwiTTQuNSAxMGExLjAyMiAxLjAyMiAwIDAxLS43OTktLjM4NGwtMi40ODgtM2ExIDEgMCAwMTEuNTc2LTEuMjMzTDQuNSA3LjM3Nmw0LjcxMi01Ljk5MWExIDEgMCAxMTEuNTc2IDEuMjNsLTUuNTFcbiAgICAgIDdBLjk3OC45NzggMCAwMTQuNSAxMHpcIiAvPlxuICB7L2lmfVxuPC9zdmc+XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBhZnRlclVwZGF0ZSwgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgZXhwb3J0IGxldCBzY2FsZSA9IFwiTVwiO1xuICBleHBvcnQgbGV0IGNsYXNzTmFtZSA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgd2lkdGggPSBcIlwiO1xuICBleHBvcnQgbGV0IGhlaWdodCA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgYXJpYUxhYmVsID0gXCJDaGV2cm9uRG93bk1lZGl1bVwiO1xuICBsZXQgcGF0aDtcbiAgbGV0IHN3O1xuICBsZXQgc2g7XG5cbiAgbGV0IGZsYWcgPSAxNDtcbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICB9KTtcblxuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICAgIGlmICghc2NhbGUgfHwgc2NhbGUgPT0gXCJNXCIpIHtcbiAgICAgIGxldCByb290Q2xhc3NOYW1lID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZTtcbiAgICAgIGlmIChyb290Q2xhc3NOYW1lICYmIHJvb3RDbGFzc05hbWUuaW5kZXhPZihcInNwZWN0cnVtLS1sYXJnZVwiKSAhPSAtMSkge1xuICAgICAgICBzY2FsZSA9IFwiTFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NhbGUgPSBcIk1cIjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuPC9zY3JpcHQ+XG5cblxuXG48c3ZnXG4gIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgey4uLiQkcmVzdFByb3BzfVxuICB3aWR0aD17d2lkdGggfHwgc3cgfHwgZmxhZ31cbiAgaGVpZ2h0PXtoZWlnaHQgfHwgc2ggfHwgZmxhZ31cbiAgZmlsbD1cImN1cnJlbnRDb2xvclwiXG4gIGNsYXNzPVwic3BlY3RydW0tSWNvbiB7Y2xhc3NOYW1lfVwiPlxuICB7I2lmIHNjYWxlID09PSAnTCd9XG4gICAgPHBhdGhcbiAgICAgIGJpbmQ6dGhpcz17cGF0aH1cbiAgICBkPVwiTTExLjk5IDEuNTFhMSAxIDAgMDAtMS43MDctLjcwN0w2IDUuMDg2IDEuNzE3LjgwM0ExIDEgMCAxMC4zMDMgMi4yMTdsNC45OSA0Ljk5YTEgMSAwIDAwMS40MTQgMGw0Ljk5LTQuOTlhLjk5Ny45OTdcbiAgICAwIDAwLjI5My0uNzA3elwiXG4vPlxuICB7OmVsc2UgaWYgc2NhbGUgPT09ICdNJ31cbiAgICA8cGF0aFxuICAgICAgYmluZDp0aGlzPXtwYXRofVxuICAgIGQ9XCJNOS45OSAxLjAxQTEgMSAwIDAwOC4yODMuMzAzTDUgMy41ODYgMS43MTcuMzAzQTEgMSAwIDEwLjMwMyAxLjcxN2wzLjk5IDMuOThhMSAxIDAgMDAxLjQxNCAwbDMuOTktMy45OGEuOTk3Ljk5NyAwXG4gICAgMDAuMjkzLS43MDd6XCIvPlxuICB7L2lmfVxuPC9zdmc+XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBhZnRlclVwZGF0ZSwgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgZXhwb3J0IGxldCBzY2FsZSA9IFwiTVwiO1xuICBleHBvcnQgbGV0IGNsYXNzTmFtZSA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgd2lkdGggPSBcIlwiO1xuICBleHBvcnQgbGV0IGhlaWdodCA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgYXJpYUxhYmVsID0gXCJDaGV2cm9uUmlnaHRNZWRpdW1cIjtcbiAgbGV0IHBhdGg7XG4gIGxldCBzdztcbiAgbGV0IHNoO1xuXG4gIGxldCBmbGFnID0gMTQ7XG4gIG9uTW91bnQoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgfSk7XG5cbiAgYWZ0ZXJVcGRhdGUoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgICBpZiAoIXNjYWxlIHx8IHNjYWxlID09IFwiTVwiKSB7XG4gICAgICBsZXQgcm9vdENsYXNzTmFtZSA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc05hbWU7XG4gICAgICBpZiAocm9vdENsYXNzTmFtZSAmJiByb290Q2xhc3NOYW1lLmluZGV4T2YoXCJzcGVjdHJ1bS0tbGFyZ2VcIikgIT0gLTEpIHtcbiAgICAgICAgc2NhbGUgPSBcIkxcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYWxlID0gXCJNXCI7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbjwvc2NyaXB0PlxuXG5cblxuPHN2Z1xuICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gIHsuLi4kJHJlc3RQcm9wc31cbiAgd2lkdGg9e3dpZHRoIHx8IHN3IHx8IGZsYWd9XG4gIGhlaWdodD17aGVpZ2h0IHx8IHNoIHx8IGZsYWd9XG4gIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICBjbGFzcz1cInNwZWN0cnVtLUljb24ge2NsYXNzTmFtZX1cIj5cbiAgeyNpZiBzY2FsZSA9PT0gJ0wnfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgZD1cIk03LjUgNmEuOTk3Ljk5NyAwIDAwLS4yOTMtLjcwN0wyLjIxNy4zMDNBMSAxIDAgMTAuODAzIDEuNzE3TDUuMDg2IDYgLjgwMyAxMC4yODNhMSAxIDAgMTAxLjQxNFxuICAgIDEuNDE0bDQuOTktNC45OUEuOTk3Ljk5NyAwIDAwNy41IDZ6XCJcbi8+XG4gIHs6ZWxzZSBpZiBzY2FsZSA9PT0gJ00nfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgZD1cIk01Ljk5IDVhLjk5Ny45OTcgMCAwMC0uMjkzLS43MDdMMS43MTcuMzAzQTEgMSAwIDEwLjMwMyAxLjcxN0wzLjU4NiA1IC4zMDMgOC4yODNhMSAxIDAgMTAxLjQxNFxuICAgIDEuNDE0bDMuOTgtMy45OUEuOTk3Ljk5NyAwIDAwNS45OSA1elwiLz5cbiAgey9pZn1cbjwvc3ZnPlxuIiwiLyoqXHJcbiAqIEEgY29sbGVjdGlvbiBvZiBzaGltcyB0aGF0IHByb3ZpZGUgbWluaW1hbCBmdW5jdGlvbmFsaXR5IG9mIHRoZSBFUzYgY29sbGVjdGlvbnMuXHJcbiAqXHJcbiAqIFRoZXNlIGltcGxlbWVudGF0aW9ucyBhcmUgbm90IG1lYW50IHRvIGJlIHVzZWQgb3V0c2lkZSBvZiB0aGUgUmVzaXplT2JzZXJ2ZXJcclxuICogbW9kdWxlcyBhcyB0aGV5IGNvdmVyIG9ubHkgYSBsaW1pdGVkIHJhbmdlIG9mIHVzZSBjYXNlcy5cclxuICovXHJcbi8qIGVzbGludC1kaXNhYmxlIHJlcXVpcmUtanNkb2MsIHZhbGlkLWpzZG9jICovXHJcbnZhciBNYXBTaGltID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0eXBlb2YgTWFwICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiBNYXA7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaW5kZXggaW4gcHJvdmlkZWQgYXJyYXkgdGhhdCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7QXJyYXk8QXJyYXk+fSBhcnJcclxuICAgICAqIEBwYXJhbSB7Kn0ga2V5XHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRJbmRleChhcnIsIGtleSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAtMTtcclxuICAgICAgICBhcnIuc29tZShmdW5jdGlvbiAoZW50cnksIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeVswXSA9PT0ga2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBjbGFzc18xKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9fZW50cmllc19fID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGFzc18xLnByb3RvdHlwZSwgXCJzaXplXCIsIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fX2VudHJpZXNfXy5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0ga2V5XHJcbiAgICAgICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBnZXRJbmRleCh0aGlzLl9fZW50cmllc19fLCBrZXkpO1xyXG4gICAgICAgICAgICB2YXIgZW50cnkgPSB0aGlzLl9fZW50cmllc19fW2luZGV4XTtcclxuICAgICAgICAgICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5WzFdO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcclxuICAgICAgICAgKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXgodGhpcy5fX2VudHJpZXNfXywga2V5KTtcclxuICAgICAgICAgICAgaWYgKH5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fX2VudHJpZXNfX1tpbmRleF1bMV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX19lbnRyaWVzX18ucHVzaChba2V5LCB2YWx1ZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAcGFyYW0geyp9IGtleVxyXG4gICAgICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsYXNzXzEucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGVudHJpZXMgPSB0aGlzLl9fZW50cmllc19fO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBnZXRJbmRleChlbnRyaWVzLCBrZXkpO1xyXG4gICAgICAgICAgICBpZiAofmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBlbnRyaWVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0ga2V5XHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF+Z2V0SW5kZXgodGhpcy5fX2VudHJpZXNfXywga2V5KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsYXNzXzEucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9fZW50cmllc19fLnNwbGljZSgwKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBbY3R4PW51bGxdXHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgY3R4KSB7XHJcbiAgICAgICAgICAgIGlmIChjdHggPT09IHZvaWQgMCkgeyBjdHggPSBudWxsOyB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLl9fZW50cmllc19fOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVudHJ5ID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjdHgsIGVudHJ5WzFdLCBlbnRyeVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBjbGFzc18xO1xyXG4gICAgfSgpKTtcclxufSkoKTtcblxuLyoqXHJcbiAqIERldGVjdHMgd2hldGhlciB3aW5kb3cgYW5kIGRvY3VtZW50IG9iamVjdHMgYXJlIGF2YWlsYWJsZSBpbiBjdXJyZW50IGVudmlyb25tZW50LlxyXG4gKi9cclxudmFyIGlzQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50ID09PSBkb2N1bWVudDtcblxuLy8gUmV0dXJucyBnbG9iYWwgb2JqZWN0IG9mIGEgY3VycmVudCBlbnZpcm9ubWVudC5cclxudmFyIGdsb2JhbCQxID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiBnbG9iYWwuTWF0aCA9PT0gTWF0aCkge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWw7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PT0gTWF0aCkge1xyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09PSBNYXRoKSB7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdztcclxuICAgIH1cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xyXG4gICAgcmV0dXJuIEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XHJcbn0pKCk7XG5cbi8qKlxyXG4gKiBBIHNoaW0gZm9yIHRoZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgd2hpY2ggZmFsbHMgYmFjayB0byB0aGUgc2V0VGltZW91dCBpZlxyXG4gKiBmaXJzdCBvbmUgaXMgbm90IHN1cHBvcnRlZC5cclxuICpcclxuICogQHJldHVybnMge251bWJlcn0gUmVxdWVzdHMnIGlkZW50aWZpZXIuXHJcbiAqL1xyXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lJDEgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvLyBJdCdzIHJlcXVpcmVkIHRvIHVzZSBhIGJvdW5kZWQgZnVuY3Rpb24gYmVjYXVzZSBJRSBzb21ldGltZXMgdGhyb3dzXHJcbiAgICAgICAgLy8gYW4gXCJJbnZhbGlkIGNhbGxpbmcgb2JqZWN0XCIgZXJyb3IgaWYgckFGIGlzIGludm9rZWQgd2l0aG91dCB0aGUgZ2xvYmFsXHJcbiAgICAgICAgLy8gb2JqZWN0IG9uIHRoZSBsZWZ0IGhhbmQgc2lkZS5cclxuICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQoZ2xvYmFsJDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykgeyByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBjYWxsYmFjayhEYXRlLm5vdygpKTsgfSwgMTAwMCAvIDYwKTsgfTtcclxufSkoKTtcblxuLy8gRGVmaW5lcyBtaW5pbXVtIHRpbWVvdXQgYmVmb3JlIGFkZGluZyBhIHRyYWlsaW5nIGNhbGwuXHJcbnZhciB0cmFpbGluZ1RpbWVvdXQgPSAyO1xyXG4vKipcclxuICogQ3JlYXRlcyBhIHdyYXBwZXIgZnVuY3Rpb24gd2hpY2ggZW5zdXJlcyB0aGF0IHByb3ZpZGVkIGNhbGxiYWNrIHdpbGwgYmVcclxuICogaW52b2tlZCBvbmx5IG9uY2UgZHVyaW5nIHRoZSBzcGVjaWZpZWQgZGVsYXkgcGVyaW9kLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGJlIGludm9rZWQgYWZ0ZXIgdGhlIGRlbGF5IHBlcmlvZC5cclxuICogQHBhcmFtIHtudW1iZXJ9IGRlbGF5IC0gRGVsYXkgYWZ0ZXIgd2hpY2ggdG8gaW52b2tlIGNhbGxiYWNrLlxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAqL1xyXG5mdW5jdGlvbiB0aHJvdHRsZSAoY2FsbGJhY2ssIGRlbGF5KSB7XHJcbiAgICB2YXIgbGVhZGluZ0NhbGwgPSBmYWxzZSwgdHJhaWxpbmdDYWxsID0gZmFsc2UsIGxhc3RDYWxsVGltZSA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIEludm9rZXMgdGhlIG9yaWdpbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIGFuZCBzY2hlZHVsZXMgbmV3IGludm9jYXRpb24gaWZcclxuICAgICAqIHRoZSBcInByb3h5XCIgd2FzIGNhbGxlZCBkdXJpbmcgY3VycmVudCByZXF1ZXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZXNvbHZlUGVuZGluZygpIHtcclxuICAgICAgICBpZiAobGVhZGluZ0NhbGwpIHtcclxuICAgICAgICAgICAgbGVhZGluZ0NhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRyYWlsaW5nQ2FsbCkge1xyXG4gICAgICAgICAgICBwcm94eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGJhY2sgaW52b2tlZCBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5LiBJdCB3aWxsIGZ1cnRoZXIgcG9zdHBvbmVcclxuICAgICAqIGludm9jYXRpb24gb2YgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIGRlbGVnYXRpbmcgaXQgdG8gdGhlXHJcbiAgICAgKiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRpbWVvdXRDYWxsYmFjaygpIHtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUkMShyZXNvbHZlUGVuZGluZyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNjaGVkdWxlcyBpbnZvY2F0aW9uIG9mIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcHJveHkoKSB7XHJcbiAgICAgICAgdmFyIHRpbWVTdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKGxlYWRpbmdDYWxsKSB7XHJcbiAgICAgICAgICAgIC8vIFJlamVjdCBpbW1lZGlhdGVseSBmb2xsb3dpbmcgY2FsbHMuXHJcbiAgICAgICAgICAgIGlmICh0aW1lU3RhbXAgLSBsYXN0Q2FsbFRpbWUgPCB0cmFpbGluZ1RpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTY2hlZHVsZSBuZXcgY2FsbCB0byBiZSBpbiBpbnZva2VkIHdoZW4gdGhlIHBlbmRpbmcgb25lIGlzIHJlc29sdmVkLlxyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGltcG9ydGFudCBmb3IgXCJ0cmFuc2l0aW9uc1wiIHdoaWNoIG5ldmVyIGFjdHVhbGx5IHN0YXJ0XHJcbiAgICAgICAgICAgIC8vIGltbWVkaWF0ZWx5IHNvIHRoZXJlIGlzIGEgY2hhbmNlIHRoYXQgd2UgbWlnaHQgbWlzcyBvbmUgaWYgY2hhbmdlXHJcbiAgICAgICAgICAgIC8vIGhhcHBlbnMgYW1pZHMgdGhlIHBlbmRpbmcgaW52b2NhdGlvbi5cclxuICAgICAgICAgICAgdHJhaWxpbmdDYWxsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxlYWRpbmdDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgdHJhaWxpbmdDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQodGltZW91dENhbGxiYWNrLCBkZWxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhc3RDYWxsVGltZSA9IHRpbWVTdGFtcDtcclxuICAgIH1cclxuICAgIHJldHVybiBwcm94eTtcclxufVxuXG4vLyBNaW5pbXVtIGRlbGF5IGJlZm9yZSBpbnZva2luZyB0aGUgdXBkYXRlIG9mIG9ic2VydmVycy5cclxudmFyIFJFRlJFU0hfREVMQVkgPSAyMDtcclxuLy8gQSBsaXN0IG9mIHN1YnN0cmluZ3Mgb2YgQ1NTIHByb3BlcnRpZXMgdXNlZCB0byBmaW5kIHRyYW5zaXRpb24gZXZlbnRzIHRoYXRcclxuLy8gbWlnaHQgYWZmZWN0IGRpbWVuc2lvbnMgb2Ygb2JzZXJ2ZWQgZWxlbWVudHMuXHJcbnZhciB0cmFuc2l0aW9uS2V5cyA9IFsndG9wJywgJ3JpZ2h0JywgJ2JvdHRvbScsICdsZWZ0JywgJ3dpZHRoJywgJ2hlaWdodCcsICdzaXplJywgJ3dlaWdodCddO1xyXG4vLyBDaGVjayBpZiBNdXRhdGlvbk9ic2VydmVyIGlzIGF2YWlsYWJsZS5cclxudmFyIG11dGF0aW9uT2JzZXJ2ZXJTdXBwb3J0ZWQgPSB0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCc7XHJcbi8qKlxyXG4gKiBTaW5nbGV0b24gY29udHJvbGxlciBjbGFzcyB3aGljaCBoYW5kbGVzIHVwZGF0ZXMgb2YgUmVzaXplT2JzZXJ2ZXIgaW5zdGFuY2VzLlxyXG4gKi9cclxudmFyIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIERPTSBsaXN0ZW5lcnMgaGF2ZSBiZWVuIGFkZGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHByaXZhdGUge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWRfID0gZmFsc2U7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGVsbHMgdGhhdCBjb250cm9sbGVyIGhhcyBzdWJzY3JpYmVkIGZvciBNdXRhdGlvbiBFdmVudHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm11dGF0aW9uRXZlbnRzQWRkZWRfID0gZmFsc2U7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgcmVmZXJlbmNlIHRvIHRoZSBpbnN0YW5jZSBvZiBNdXRhdGlvbk9ic2VydmVyLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHByaXZhdGUge011dGF0aW9uT2JzZXJ2ZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5tdXRhdGlvbnNPYnNlcnZlcl8gPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEEgbGlzdCBvZiBjb25uZWN0ZWQgb2JzZXJ2ZXJzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHByaXZhdGUge0FycmF5PFJlc2l6ZU9ic2VydmVyU1BJPn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9ic2VydmVyc18gPSBbXTtcclxuICAgICAgICB0aGlzLm9uVHJhbnNpdGlvbkVuZF8gPSB0aGlzLm9uVHJhbnNpdGlvbkVuZF8uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2ggPSB0aHJvdHRsZSh0aGlzLnJlZnJlc2guYmluZCh0aGlzKSwgUkVGUkVTSF9ERUxBWSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgb2JzZXJ2ZXIgdG8gb2JzZXJ2ZXJzIGxpc3QuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtSZXNpemVPYnNlcnZlclNQSX0gb2JzZXJ2ZXIgLSBPYnNlcnZlciB0byBiZSBhZGRlZC5cclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIucHJvdG90eXBlLmFkZE9ic2VydmVyID0gZnVuY3Rpb24gKG9ic2VydmVyKSB7XHJcbiAgICAgICAgaWYgKCF+dGhpcy5vYnNlcnZlcnNfLmluZGV4T2Yob2JzZXJ2ZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzXy5wdXNoKG9ic2VydmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQWRkIGxpc3RlbmVycyBpZiB0aGV5IGhhdmVuJ3QgYmVlbiBhZGRlZCB5ZXQuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbm5lY3RlZF8pIHtcclxuICAgICAgICAgICAgdGhpcy5jb25uZWN0XygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgb2JzZXJ2ZXIgZnJvbSBvYnNlcnZlcnMgbGlzdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1Jlc2l6ZU9ic2VydmVyU1BJfSBvYnNlcnZlciAtIE9ic2VydmVyIHRvIGJlIHJlbW92ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLnByb3RvdHlwZS5yZW1vdmVPYnNlcnZlciA9IGZ1bmN0aW9uIChvYnNlcnZlcikge1xyXG4gICAgICAgIHZhciBvYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVyc187XHJcbiAgICAgICAgdmFyIGluZGV4ID0gb2JzZXJ2ZXJzLmluZGV4T2Yob2JzZXJ2ZXIpO1xyXG4gICAgICAgIC8vIFJlbW92ZSBvYnNlcnZlciBpZiBpdCdzIHByZXNlbnQgaW4gcmVnaXN0cnkuXHJcbiAgICAgICAgaWYgKH5pbmRleCkge1xyXG4gICAgICAgICAgICBvYnNlcnZlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBpZiBjb250cm9sbGVyIGhhcyBubyBjb25uZWN0ZWQgb2JzZXJ2ZXJzLlxyXG4gICAgICAgIGlmICghb2JzZXJ2ZXJzLmxlbmd0aCAmJiB0aGlzLmNvbm5lY3RlZF8pIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNjb25uZWN0XygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEludm9rZXMgdGhlIHVwZGF0ZSBvZiBvYnNlcnZlcnMuIEl0IHdpbGwgY29udGludWUgcnVubmluZyB1cGRhdGVzIGluc29mYXJcclxuICAgICAqIGl0IGRldGVjdHMgY2hhbmdlcy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjaGFuZ2VzRGV0ZWN0ZWQgPSB0aGlzLnVwZGF0ZU9ic2VydmVyc18oKTtcclxuICAgICAgICAvLyBDb250aW51ZSBydW5uaW5nIHVwZGF0ZXMgaWYgY2hhbmdlcyBoYXZlIGJlZW4gZGV0ZWN0ZWQgYXMgdGhlcmUgbWlnaHRcclxuICAgICAgICAvLyBiZSBmdXR1cmUgb25lcyBjYXVzZWQgYnkgQ1NTIHRyYW5zaXRpb25zLlxyXG4gICAgICAgIGlmIChjaGFuZ2VzRGV0ZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyBldmVyeSBvYnNlcnZlciBmcm9tIG9ic2VydmVycyBsaXN0IGFuZCBub3RpZmllcyB0aGVtIG9mIHF1ZXVlZFxyXG4gICAgICogZW50cmllcy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgXCJ0cnVlXCIgaWYgYW55IG9ic2VydmVyIGhhcyBkZXRlY3RlZCBjaGFuZ2VzIGluXHJcbiAgICAgKiAgICAgIGRpbWVuc2lvbnMgb2YgaXQncyBlbGVtZW50cy5cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVPYnNlcnZlcnNfID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIENvbGxlY3Qgb2JzZXJ2ZXJzIHRoYXQgaGF2ZSBhY3RpdmUgb2JzZXJ2YXRpb25zLlxyXG4gICAgICAgIHZhciBhY3RpdmVPYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVyc18uZmlsdGVyKGZ1bmN0aW9uIChvYnNlcnZlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXIuZ2F0aGVyQWN0aXZlKCksIG9ic2VydmVyLmhhc0FjdGl2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIERlbGl2ZXIgbm90aWZpY2F0aW9ucyBpbiBhIHNlcGFyYXRlIGN5Y2xlIGluIG9yZGVyIHRvIGF2b2lkIGFueVxyXG4gICAgICAgIC8vIGNvbGxpc2lvbnMgYmV0d2VlbiBvYnNlcnZlcnMsIGUuZy4gd2hlbiBtdWx0aXBsZSBpbnN0YW5jZXMgb2ZcclxuICAgICAgICAvLyBSZXNpemVPYnNlcnZlciBhcmUgdHJhY2tpbmcgdGhlIHNhbWUgZWxlbWVudCBhbmQgdGhlIGNhbGxiYWNrIG9mIG9uZVxyXG4gICAgICAgIC8vIG9mIHRoZW0gY2hhbmdlcyBjb250ZW50IGRpbWVuc2lvbnMgb2YgdGhlIG9ic2VydmVkIHRhcmdldC4gU29tZXRpbWVzXHJcbiAgICAgICAgLy8gdGhpcyBtYXkgcmVzdWx0IGluIG5vdGlmaWNhdGlvbnMgYmVpbmcgYmxvY2tlZCBmb3IgdGhlIHJlc3Qgb2Ygb2JzZXJ2ZXJzLlxyXG4gICAgICAgIGFjdGl2ZU9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZlcikgeyByZXR1cm4gb2JzZXJ2ZXIuYnJvYWRjYXN0QWN0aXZlKCk7IH0pO1xyXG4gICAgICAgIHJldHVybiBhY3RpdmVPYnNlcnZlcnMubGVuZ3RoID4gMDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemVzIERPTSBsaXN0ZW5lcnMuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIucHJvdG90eXBlLmNvbm5lY3RfID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIERvIG5vdGhpbmcgaWYgcnVubmluZyBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50IG9yIGlmIGxpc3RlbmVyc1xyXG4gICAgICAgIC8vIGhhdmUgYmVlbiBhbHJlYWR5IGFkZGVkLlxyXG4gICAgICAgIGlmICghaXNCcm93c2VyIHx8IHRoaXMuY29ubmVjdGVkXykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFN1YnNjcmlwdGlvbiB0byB0aGUgXCJUcmFuc2l0aW9uZW5kXCIgZXZlbnQgaXMgdXNlZCBhcyBhIHdvcmthcm91bmQgZm9yXHJcbiAgICAgICAgLy8gZGVsYXllZCB0cmFuc2l0aW9ucy4gVGhpcyB3YXkgaXQncyBwb3NzaWJsZSB0byBjYXB0dXJlIGF0IGxlYXN0IHRoZVxyXG4gICAgICAgIC8vIGZpbmFsIHN0YXRlIG9mIGFuIGVsZW1lbnQuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHRoaXMub25UcmFuc2l0aW9uRW5kXyk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVmcmVzaCk7XHJcbiAgICAgICAgaWYgKG11dGF0aW9uT2JzZXJ2ZXJTdXBwb3J0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5tdXRhdGlvbnNPYnNlcnZlcl8gPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLnJlZnJlc2gpO1xyXG4gICAgICAgICAgICB0aGlzLm11dGF0aW9uc09ic2VydmVyXy5vYnNlcnZlKGRvY3VtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01TdWJ0cmVlTW9kaWZpZWQnLCB0aGlzLnJlZnJlc2gpO1xyXG4gICAgICAgICAgICB0aGlzLm11dGF0aW9uRXZlbnRzQWRkZWRfID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWRfID0gdHJ1ZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgRE9NIGxpc3RlbmVycy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5wcm90b3R5cGUuZGlzY29ubmVjdF8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiBydW5uaW5nIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQgb3IgaWYgbGlzdGVuZXJzXHJcbiAgICAgICAgLy8gaGF2ZSBiZWVuIGFscmVhZHkgcmVtb3ZlZC5cclxuICAgICAgICBpZiAoIWlzQnJvd3NlciB8fCAhdGhpcy5jb25uZWN0ZWRfKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHRoaXMub25UcmFuc2l0aW9uRW5kXyk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVmcmVzaCk7XHJcbiAgICAgICAgaWYgKHRoaXMubXV0YXRpb25zT2JzZXJ2ZXJfKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRpb25zT2JzZXJ2ZXJfLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubXV0YXRpb25FdmVudHNBZGRlZF8pIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NU3VidHJlZU1vZGlmaWVkJywgdGhpcy5yZWZyZXNoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tdXRhdGlvbnNPYnNlcnZlcl8gPSBudWxsO1xyXG4gICAgICAgIHRoaXMubXV0YXRpb25FdmVudHNBZGRlZF8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3RlZF8gPSBmYWxzZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFwiVHJhbnNpdGlvbmVuZFwiIGV2ZW50IGhhbmRsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7VHJhbnNpdGlvbkV2ZW50fSBldmVudFxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5wcm90b3R5cGUub25UcmFuc2l0aW9uRW5kXyA9IGZ1bmN0aW9uIChfYSkge1xyXG4gICAgICAgIHZhciBfYiA9IF9hLnByb3BlcnR5TmFtZSwgcHJvcGVydHlOYW1lID0gX2IgPT09IHZvaWQgMCA/ICcnIDogX2I7XHJcbiAgICAgICAgLy8gRGV0ZWN0IHdoZXRoZXIgdHJhbnNpdGlvbiBtYXkgYWZmZWN0IGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudC5cclxuICAgICAgICB2YXIgaXNSZWZsb3dQcm9wZXJ0eSA9IHRyYW5zaXRpb25LZXlzLnNvbWUoZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF+cHJvcGVydHlOYW1lLmluZGV4T2Yoa2V5KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoaXNSZWZsb3dQcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGluc3RhbmNlIG9mIHRoZSBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Jlc2l6ZU9ic2VydmVyQ29udHJvbGxlcn1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLmdldEluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pbnN0YW5jZV8pIHtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV8gPSBuZXcgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlXztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEhvbGRzIHJlZmVyZW5jZSB0byB0aGUgY29udHJvbGxlcidzIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlIHtSZXNpemVPYnNlcnZlckNvbnRyb2xsZXJ9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5pbnN0YW5jZV8gPSBudWxsO1xyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlcjtcclxufSgpKTtcblxuLyoqXHJcbiAqIERlZmluZXMgbm9uLXdyaXRhYmxlL2VudW1lcmFibGUgcHJvcGVydGllcyBvZiB0aGUgcHJvdmlkZWQgdGFyZ2V0IG9iamVjdC5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCAtIE9iamVjdCBmb3Igd2hpY2ggdG8gZGVmaW5lIHByb3BlcnRpZXMuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyAtIFByb3BlcnRpZXMgdG8gYmUgZGVmaW5lZC5cclxuICogQHJldHVybnMge09iamVjdH0gVGFyZ2V0IG9iamVjdC5cclxuICovXHJcbnZhciBkZWZpbmVDb25maWd1cmFibGUgPSAoZnVuY3Rpb24gKHRhcmdldCwgcHJvcHMpIHtcclxuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3Qua2V5cyhwcm9wcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHtcclxuICAgICAgICAgICAgdmFsdWU6IHByb3BzW2tleV0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhcmdldDtcclxufSk7XG5cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBnbG9iYWwgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCBwcm92aWRlZCBlbGVtZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0XHJcbiAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgZ2V0V2luZG93T2YgPSAoZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgLy8gQXNzdW1lIHRoYXQgdGhlIGVsZW1lbnQgaXMgYW4gaW5zdGFuY2Ugb2YgTm9kZSwgd2hpY2ggbWVhbnMgdGhhdCBpdFxyXG4gICAgLy8gaGFzIHRoZSBcIm93bmVyRG9jdW1lbnRcIiBwcm9wZXJ0eSBmcm9tIHdoaWNoIHdlIGNhbiByZXRyaWV2ZSBhXHJcbiAgICAvLyBjb3JyZXNwb25kaW5nIGdsb2JhbCBvYmplY3QuXHJcbiAgICB2YXIgb3duZXJHbG9iYWwgPSB0YXJnZXQgJiYgdGFyZ2V0Lm93bmVyRG9jdW1lbnQgJiYgdGFyZ2V0Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XHJcbiAgICAvLyBSZXR1cm4gdGhlIGxvY2FsIGdsb2JhbCBvYmplY3QgaWYgaXQncyBub3QgcG9zc2libGUgZXh0cmFjdCBvbmUgZnJvbVxyXG4gICAgLy8gcHJvdmlkZWQgZWxlbWVudC5cclxuICAgIHJldHVybiBvd25lckdsb2JhbCB8fCBnbG9iYWwkMTtcclxufSk7XG5cbi8vIFBsYWNlaG9sZGVyIG9mIGFuIGVtcHR5IGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG52YXIgZW1wdHlSZWN0ID0gY3JlYXRlUmVjdEluaXQoMCwgMCwgMCwgMCk7XHJcbi8qKlxyXG4gKiBDb252ZXJ0cyBwcm92aWRlZCBzdHJpbmcgdG8gYSBudW1iZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gdmFsdWVcclxuICogQHJldHVybnMge251bWJlcn1cclxuICovXHJcbmZ1bmN0aW9uIHRvRmxvYXQodmFsdWUpIHtcclxuICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKSB8fCAwO1xyXG59XHJcbi8qKlxyXG4gKiBFeHRyYWN0cyBib3JkZXJzIHNpemUgZnJvbSBwcm92aWRlZCBzdHlsZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Q1NTU3R5bGVEZWNsYXJhdGlvbn0gc3R5bGVzXHJcbiAqIEBwYXJhbSB7Li4uc3RyaW5nfSBwb3NpdGlvbnMgLSBCb3JkZXJzIHBvc2l0aW9ucyAodG9wLCByaWdodCwgLi4uKVxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Qm9yZGVyc1NpemUoc3R5bGVzKSB7XHJcbiAgICB2YXIgcG9zaXRpb25zID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHBvc2l0aW9uc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIHJldHVybiBwb3NpdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChzaXplLCBwb3NpdGlvbikge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHN0eWxlc1snYm9yZGVyLScgKyBwb3NpdGlvbiArICctd2lkdGgnXTtcclxuICAgICAgICByZXR1cm4gc2l6ZSArIHRvRmxvYXQodmFsdWUpO1xyXG4gICAgfSwgMCk7XHJcbn1cclxuLyoqXHJcbiAqIEV4dHJhY3RzIHBhZGRpbmdzIHNpemVzIGZyb20gcHJvdmlkZWQgc3R5bGVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0NTU1N0eWxlRGVjbGFyYXRpb259IHN0eWxlc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBQYWRkaW5ncyBib3guXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRQYWRkaW5ncyhzdHlsZXMpIHtcclxuICAgIHZhciBwb3NpdGlvbnMgPSBbJ3RvcCcsICdyaWdodCcsICdib3R0b20nLCAnbGVmdCddO1xyXG4gICAgdmFyIHBhZGRpbmdzID0ge307XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIHBvc2l0aW9uc18xID0gcG9zaXRpb25zOyBfaSA8IHBvc2l0aW9uc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IHBvc2l0aW9uc18xW19pXTtcclxuICAgICAgICB2YXIgdmFsdWUgPSBzdHlsZXNbJ3BhZGRpbmctJyArIHBvc2l0aW9uXTtcclxuICAgICAgICBwYWRkaW5nc1twb3NpdGlvbl0gPSB0b0Zsb2F0KHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYWRkaW5ncztcclxufVxyXG4vKipcclxuICogQ2FsY3VsYXRlcyBjb250ZW50IHJlY3RhbmdsZSBvZiBwcm92aWRlZCBTVkcgZWxlbWVudC5cclxuICpcclxuICogQHBhcmFtIHtTVkdHcmFwaGljc0VsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgY29udGVudCByZWN0YW5nbGUgb2Ygd2hpY2ggbmVlZHNcclxuICogICAgICB0byBiZSBjYWxjdWxhdGVkLlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdEluaXR9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTVkdDb250ZW50UmVjdCh0YXJnZXQpIHtcclxuICAgIHZhciBiYm94ID0gdGFyZ2V0LmdldEJCb3goKTtcclxuICAgIHJldHVybiBjcmVhdGVSZWN0SW5pdCgwLCAwLCBiYm94LndpZHRoLCBiYm94LmhlaWdodCk7XHJcbn1cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgY29udGVudCByZWN0YW5nbGUgb2YgcHJvdmlkZWQgSFRNTEVsZW1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgZm9yIHdoaWNoIHRvIGNhbGN1bGF0ZSB0aGUgY29udGVudCByZWN0YW5nbGUuXHJcbiAqIEByZXR1cm5zIHtET01SZWN0SW5pdH1cclxuICovXHJcbmZ1bmN0aW9uIGdldEhUTUxFbGVtZW50Q29udGVudFJlY3QodGFyZ2V0KSB7XHJcbiAgICAvLyBDbGllbnQgd2lkdGggJiBoZWlnaHQgcHJvcGVydGllcyBjYW4ndCBiZVxyXG4gICAgLy8gdXNlZCBleGNsdXNpdmVseSBhcyB0aGV5IHByb3ZpZGUgcm91bmRlZCB2YWx1ZXMuXHJcbiAgICB2YXIgY2xpZW50V2lkdGggPSB0YXJnZXQuY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodCA9IHRhcmdldC5jbGllbnRIZWlnaHQ7XHJcbiAgICAvLyBCeSB0aGlzIGNvbmRpdGlvbiB3ZSBjYW4gY2F0Y2ggYWxsIG5vbi1yZXBsYWNlZCBpbmxpbmUsIGhpZGRlbiBhbmRcclxuICAgIC8vIGRldGFjaGVkIGVsZW1lbnRzLiBUaG91Z2ggZWxlbWVudHMgd2l0aCB3aWR0aCAmIGhlaWdodCBwcm9wZXJ0aWVzIGxlc3NcclxuICAgIC8vIHRoYW4gMC41IHdpbGwgYmUgZGlzY2FyZGVkIGFzIHdlbGwuXHJcbiAgICAvL1xyXG4gICAgLy8gV2l0aG91dCBpdCB3ZSB3b3VsZCBuZWVkIHRvIGltcGxlbWVudCBzZXBhcmF0ZSBtZXRob2RzIGZvciBlYWNoIG9mXHJcbiAgICAvLyB0aG9zZSBjYXNlcyBhbmQgaXQncyBub3QgcG9zc2libGUgdG8gcGVyZm9ybSBhIHByZWNpc2UgYW5kIHBlcmZvcm1hbmNlXHJcbiAgICAvLyBlZmZlY3RpdmUgdGVzdCBmb3IgaGlkZGVuIGVsZW1lbnRzLiBFLmcuIGV2ZW4galF1ZXJ5J3MgJzp2aXNpYmxlJyBmaWx0ZXJcclxuICAgIC8vIGdpdmVzIHdyb25nIHJlc3VsdHMgZm9yIGVsZW1lbnRzIHdpdGggd2lkdGggJiBoZWlnaHQgbGVzcyB0aGFuIDAuNS5cclxuICAgIGlmICghY2xpZW50V2lkdGggJiYgIWNsaWVudEhlaWdodCkge1xyXG4gICAgICAgIHJldHVybiBlbXB0eVJlY3Q7XHJcbiAgICB9XHJcbiAgICB2YXIgc3R5bGVzID0gZ2V0V2luZG93T2YodGFyZ2V0KS5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCk7XHJcbiAgICB2YXIgcGFkZGluZ3MgPSBnZXRQYWRkaW5ncyhzdHlsZXMpO1xyXG4gICAgdmFyIGhvcml6UGFkID0gcGFkZGluZ3MubGVmdCArIHBhZGRpbmdzLnJpZ2h0O1xyXG4gICAgdmFyIHZlcnRQYWQgPSBwYWRkaW5ncy50b3AgKyBwYWRkaW5ncy5ib3R0b207XHJcbiAgICAvLyBDb21wdXRlZCBzdHlsZXMgb2Ygd2lkdGggJiBoZWlnaHQgYXJlIGJlaW5nIHVzZWQgYmVjYXVzZSB0aGV5IGFyZSB0aGVcclxuICAgIC8vIG9ubHkgZGltZW5zaW9ucyBhdmFpbGFibGUgdG8gSlMgdGhhdCBjb250YWluIG5vbi1yb3VuZGVkIHZhbHVlcy4gSXQgY291bGRcclxuICAgIC8vIGJlIHBvc3NpYmxlIHRvIHV0aWxpemUgdGhlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpZiBvbmx5IGl0J3MgZGF0YSB3YXNuJ3RcclxuICAgIC8vIGFmZmVjdGVkIGJ5IENTUyB0cmFuc2Zvcm1hdGlvbnMgbGV0IGFsb25lIHBhZGRpbmdzLCBib3JkZXJzIGFuZCBzY3JvbGwgYmFycy5cclxuICAgIHZhciB3aWR0aCA9IHRvRmxvYXQoc3R5bGVzLndpZHRoKSwgaGVpZ2h0ID0gdG9GbG9hdChzdHlsZXMuaGVpZ2h0KTtcclxuICAgIC8vIFdpZHRoICYgaGVpZ2h0IGluY2x1ZGUgcGFkZGluZ3MgYW5kIGJvcmRlcnMgd2hlbiB0aGUgJ2JvcmRlci1ib3gnIGJveFxyXG4gICAgLy8gbW9kZWwgaXMgYXBwbGllZCAoZXhjZXB0IGZvciBJRSkuXHJcbiAgICBpZiAoc3R5bGVzLmJveFNpemluZyA9PT0gJ2JvcmRlci1ib3gnKSB7XHJcbiAgICAgICAgLy8gRm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIHJlcXVpcmVkIHRvIGhhbmRsZSBJbnRlcm5ldCBFeHBsb3JlciB3aGljaFxyXG4gICAgICAgIC8vIGRvZXNuJ3QgaW5jbHVkZSBwYWRkaW5ncyBhbmQgYm9yZGVycyB0byBjb21wdXRlZCBDU1MgZGltZW5zaW9ucy5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFdlIGNhbiBzYXkgdGhhdCBpZiBDU1MgZGltZW5zaW9ucyArIHBhZGRpbmdzIGFyZSBlcXVhbCB0byB0aGUgXCJjbGllbnRcIlxyXG4gICAgICAgIC8vIHByb3BlcnRpZXMgdGhlbiBpdCdzIGVpdGhlciBJRSwgYW5kIHRodXMgd2UgZG9uJ3QgbmVlZCB0byBzdWJ0cmFjdFxyXG4gICAgICAgIC8vIGFueXRoaW5nLCBvciBhbiBlbGVtZW50IG1lcmVseSBkb2Vzbid0IGhhdmUgcGFkZGluZ3MvYm9yZGVycyBzdHlsZXMuXHJcbiAgICAgICAgaWYgKE1hdGgucm91bmQod2lkdGggKyBob3JpelBhZCkgIT09IGNsaWVudFdpZHRoKSB7XHJcbiAgICAgICAgICAgIHdpZHRoIC09IGdldEJvcmRlcnNTaXplKHN0eWxlcywgJ2xlZnQnLCAncmlnaHQnKSArIGhvcml6UGFkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTWF0aC5yb3VuZChoZWlnaHQgKyB2ZXJ0UGFkKSAhPT0gY2xpZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGhlaWdodCAtPSBnZXRCb3JkZXJzU2l6ZShzdHlsZXMsICd0b3AnLCAnYm90dG9tJykgKyB2ZXJ0UGFkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEZvbGxvd2luZyBzdGVwcyBjYW4ndCBiZSBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCdzIHJvb3QgZWxlbWVudCBhcyBpdHNcclxuICAgIC8vIGNsaWVudFtXaWR0aC9IZWlnaHRdIHByb3BlcnRpZXMgcmVwcmVzZW50IHZpZXdwb3J0IGFyZWEgb2YgdGhlIHdpbmRvdy5cclxuICAgIC8vIEJlc2lkZXMsIGl0J3MgYXMgd2VsbCBub3QgbmVjZXNzYXJ5IGFzIHRoZSA8aHRtbD4gaXRzZWxmIG5laXRoZXIgaGFzXHJcbiAgICAvLyByZW5kZXJlZCBzY3JvbGwgYmFycyBub3IgaXQgY2FuIGJlIGNsaXBwZWQuXHJcbiAgICBpZiAoIWlzRG9jdW1lbnRFbGVtZW50KHRhcmdldCkpIHtcclxuICAgICAgICAvLyBJbiBzb21lIGJyb3dzZXJzIChvbmx5IGluIEZpcmVmb3gsIGFjdHVhbGx5KSBDU1Mgd2lkdGggJiBoZWlnaHRcclxuICAgICAgICAvLyBpbmNsdWRlIHNjcm9sbCBiYXJzIHNpemUgd2hpY2ggY2FuIGJlIHJlbW92ZWQgYXQgdGhpcyBzdGVwIGFzIHNjcm9sbFxyXG4gICAgICAgIC8vIGJhcnMgYXJlIHRoZSBvbmx5IGRpZmZlcmVuY2UgYmV0d2VlbiByb3VuZGVkIGRpbWVuc2lvbnMgKyBwYWRkaW5nc1xyXG4gICAgICAgIC8vIGFuZCBcImNsaWVudFwiIHByb3BlcnRpZXMsIHRob3VnaCB0aGF0IGlzIG5vdCBhbHdheXMgdHJ1ZSBpbiBDaHJvbWUuXHJcbiAgICAgICAgdmFyIHZlcnRTY3JvbGxiYXIgPSBNYXRoLnJvdW5kKHdpZHRoICsgaG9yaXpQYWQpIC0gY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdmFyIGhvcml6U2Nyb2xsYmFyID0gTWF0aC5yb3VuZChoZWlnaHQgKyB2ZXJ0UGFkKSAtIGNsaWVudEhlaWdodDtcclxuICAgICAgICAvLyBDaHJvbWUgaGFzIGEgcmF0aGVyIHdlaXJkIHJvdW5kaW5nIG9mIFwiY2xpZW50XCIgcHJvcGVydGllcy5cclxuICAgICAgICAvLyBFLmcuIGZvciBhbiBlbGVtZW50IHdpdGggY29udGVudCB3aWR0aCBvZiAzMTQuMnB4IGl0IHNvbWV0aW1lcyBnaXZlc1xyXG4gICAgICAgIC8vIHRoZSBjbGllbnQgd2lkdGggb2YgMzE1cHggYW5kIGZvciB0aGUgd2lkdGggb2YgMzE0LjdweCBpdCBtYXkgZ2l2ZVxyXG4gICAgICAgIC8vIDMxNHB4LiBBbmQgaXQgZG9lc24ndCBoYXBwZW4gYWxsIHRoZSB0aW1lLiBTbyBqdXN0IGlnbm9yZSB0aGlzIGRlbHRhXHJcbiAgICAgICAgLy8gYXMgYSBub24tcmVsZXZhbnQuXHJcbiAgICAgICAgaWYgKE1hdGguYWJzKHZlcnRTY3JvbGxiYXIpICE9PSAxKSB7XHJcbiAgICAgICAgICAgIHdpZHRoIC09IHZlcnRTY3JvbGxiYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNYXRoLmFicyhob3JpelNjcm9sbGJhcikgIT09IDEpIHtcclxuICAgICAgICAgICAgaGVpZ2h0IC09IGhvcml6U2Nyb2xsYmFyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjcmVhdGVSZWN0SW5pdChwYWRkaW5ncy5sZWZ0LCBwYWRkaW5ncy50b3AsIHdpZHRoLCBoZWlnaHQpO1xyXG59XHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBwcm92aWRlZCBlbGVtZW50IGlzIGFuIGluc3RhbmNlIG9mIHRoZSBTVkdHcmFwaGljc0VsZW1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCB0byBiZSBjaGVja2VkLlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbnZhciBpc1NWR0dyYXBoaWNzRWxlbWVudCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBTb21lIGJyb3dzZXJzLCBuYW1lbHkgSUUgYW5kIEVkZ2UsIGRvbid0IGhhdmUgdGhlIFNWR0dyYXBoaWNzRWxlbWVudFxyXG4gICAgLy8gaW50ZXJmYWNlLlxyXG4gICAgaWYgKHR5cGVvZiBTVkdHcmFwaGljc0VsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHsgcmV0dXJuIHRhcmdldCBpbnN0YW5jZW9mIGdldFdpbmRvd09mKHRhcmdldCkuU1ZHR3JhcGhpY3NFbGVtZW50OyB9O1xyXG4gICAgfVxyXG4gICAgLy8gSWYgaXQncyBzbywgdGhlbiBjaGVjayB0aGF0IGVsZW1lbnQgaXMgYXQgbGVhc3QgYW4gaW5zdGFuY2Ugb2YgdGhlXHJcbiAgICAvLyBTVkdFbGVtZW50IGFuZCB0aGF0IGl0IGhhcyB0aGUgXCJnZXRCQm94XCIgbWV0aG9kLlxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWV4dHJhLXBhcmVuc1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHsgcmV0dXJuICh0YXJnZXQgaW5zdGFuY2VvZiBnZXRXaW5kb3dPZih0YXJnZXQpLlNWR0VsZW1lbnQgJiZcclxuICAgICAgICB0eXBlb2YgdGFyZ2V0LmdldEJCb3ggPT09ICdmdW5jdGlvbicpOyB9O1xyXG59KSgpO1xyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgcHJvdmlkZWQgZWxlbWVudCBpcyBhIGRvY3VtZW50IGVsZW1lbnQgKDxodG1sPikuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCB0byBiZSBjaGVja2VkLlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzRG9jdW1lbnRFbGVtZW50KHRhcmdldCkge1xyXG4gICAgcmV0dXJuIHRhcmdldCA9PT0gZ2V0V2luZG93T2YodGFyZ2V0KS5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbn1cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgYW4gYXBwcm9wcmlhdGUgY29udGVudCByZWN0YW5nbGUgZm9yIHByb3ZpZGVkIGh0bWwgb3Igc3ZnIGVsZW1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCBjb250ZW50IHJlY3RhbmdsZSBvZiB3aGljaCBuZWVkcyB0byBiZSBjYWxjdWxhdGVkLlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdEluaXR9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRDb250ZW50UmVjdCh0YXJnZXQpIHtcclxuICAgIGlmICghaXNCcm93c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIGVtcHR5UmVjdDtcclxuICAgIH1cclxuICAgIGlmIChpc1NWR0dyYXBoaWNzRWxlbWVudCh0YXJnZXQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFNWR0NvbnRlbnRSZWN0KHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZ2V0SFRNTEVsZW1lbnRDb250ZW50UmVjdCh0YXJnZXQpO1xyXG59XHJcbi8qKlxyXG4gKiBDcmVhdGVzIHJlY3RhbmdsZSB3aXRoIGFuIGludGVyZmFjZSBvZiB0aGUgRE9NUmVjdFJlYWRPbmx5LlxyXG4gKiBTcGVjOiBodHRwczovL2RyYWZ0cy5meHRmLm9yZy9nZW9tZXRyeS8jZG9tcmVjdHJlYWRvbmx5XHJcbiAqXHJcbiAqIEBwYXJhbSB7RE9NUmVjdEluaXR9IHJlY3RJbml0IC0gT2JqZWN0IHdpdGggcmVjdGFuZ2xlJ3MgeC95IGNvb3JkaW5hdGVzIGFuZCBkaW1lbnNpb25zLlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdFJlYWRPbmx5fVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlUmVhZE9ubHlSZWN0KF9hKSB7XHJcbiAgICB2YXIgeCA9IF9hLngsIHkgPSBfYS55LCB3aWR0aCA9IF9hLndpZHRoLCBoZWlnaHQgPSBfYS5oZWlnaHQ7XHJcbiAgICAvLyBJZiBET01SZWN0UmVhZE9ubHkgaXMgYXZhaWxhYmxlIHVzZSBpdCBhcyBhIHByb3RvdHlwZSBmb3IgdGhlIHJlY3RhbmdsZS5cclxuICAgIHZhciBDb25zdHIgPSB0eXBlb2YgRE9NUmVjdFJlYWRPbmx5ICE9PSAndW5kZWZpbmVkJyA/IERPTVJlY3RSZWFkT25seSA6IE9iamVjdDtcclxuICAgIHZhciByZWN0ID0gT2JqZWN0LmNyZWF0ZShDb25zdHIucHJvdG90eXBlKTtcclxuICAgIC8vIFJlY3RhbmdsZSdzIHByb3BlcnRpZXMgYXJlIG5vdCB3cml0YWJsZSBhbmQgbm9uLWVudW1lcmFibGUuXHJcbiAgICBkZWZpbmVDb25maWd1cmFibGUocmVjdCwge1xyXG4gICAgICAgIHg6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgICAgdG9wOiB5LFxyXG4gICAgICAgIHJpZ2h0OiB4ICsgd2lkdGgsXHJcbiAgICAgICAgYm90dG9tOiBoZWlnaHQgKyB5LFxyXG4gICAgICAgIGxlZnQ6IHhcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbn1cclxuLyoqXHJcbiAqIENyZWF0ZXMgRE9NUmVjdEluaXQgb2JqZWN0IGJhc2VkIG9uIHRoZSBwcm92aWRlZCBkaW1lbnNpb25zIGFuZCB0aGUgeC95IGNvb3JkaW5hdGVzLlxyXG4gKiBTcGVjOiBodHRwczovL2RyYWZ0cy5meHRmLm9yZy9nZW9tZXRyeS8jZGljdGRlZi1kb21yZWN0aW5pdFxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggY29vcmRpbmF0ZS5cclxuICogQHBhcmFtIHtudW1iZXJ9IHkgLSBZIGNvb3JkaW5hdGUuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFJlY3RhbmdsZSdzIHdpZHRoLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gUmVjdGFuZ2xlJ3MgaGVpZ2h0LlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdEluaXR9XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVSZWN0SW5pdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICByZXR1cm4geyB4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XHJcbn1cblxuLyoqXHJcbiAqIENsYXNzIHRoYXQgaXMgcmVzcG9uc2libGUgZm9yIGNvbXB1dGF0aW9ucyBvZiB0aGUgY29udGVudCByZWN0YW5nbGUgb2ZcclxuICogcHJvdmlkZWQgRE9NIGVsZW1lbnQgYW5kIGZvciBrZWVwaW5nIHRyYWNrIG9mIGl0J3MgY2hhbmdlcy5cclxuICovXHJcbnZhciBSZXNpemVPYnNlcnZhdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgdG8gYmUgb2JzZXJ2ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFJlc2l6ZU9ic2VydmF0aW9uKHRhcmdldCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEJyb2FkY2FzdGVkIHdpZHRoIG9mIGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFdpZHRoID0gMDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBCcm9hZGNhc3RlZCBoZWlnaHQgb2YgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0SGVpZ2h0ID0gMDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIGxhc3Qgb2JzZXJ2ZWQgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7RE9NUmVjdEluaXR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jb250ZW50UmVjdF8gPSBjcmVhdGVSZWN0SW5pdCgwLCAwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyBjb250ZW50IHJlY3RhbmdsZSBhbmQgdGVsbHMgd2hldGhlciBpdCdzIHdpZHRoIG9yIGhlaWdodCBwcm9wZXJ0aWVzXHJcbiAgICAgKiBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYnJvYWRjYXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZhdGlvbi5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBnZXRDb250ZW50UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50UmVjdF8gPSByZWN0O1xyXG4gICAgICAgIHJldHVybiAocmVjdC53aWR0aCAhPT0gdGhpcy5icm9hZGNhc3RXaWR0aCB8fFxyXG4gICAgICAgICAgICByZWN0LmhlaWdodCAhPT0gdGhpcy5icm9hZGNhc3RIZWlnaHQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyAnYnJvYWRjYXN0V2lkdGgnIGFuZCAnYnJvYWRjYXN0SGVpZ2h0JyBwcm9wZXJ0aWVzIHdpdGggYSBkYXRhXHJcbiAgICAgKiBmcm9tIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnRpZXMgb2YgdGhlIGxhc3Qgb2JzZXJ2ZWQgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0RPTVJlY3RJbml0fSBMYXN0IG9ic2VydmVkIGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZhdGlvbi5wcm90b3R5cGUuYnJvYWRjYXN0UmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuY29udGVudFJlY3RfO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0V2lkdGggPSByZWN0LndpZHRoO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0SGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlY3Q7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmF0aW9uO1xyXG59KCkpO1xuXG52YXIgUmVzaXplT2JzZXJ2ZXJFbnRyeSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlckVudHJ5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCB0aGF0IGlzIGJlaW5nIG9ic2VydmVkLlxyXG4gICAgICogQHBhcmFtIHtET01SZWN0SW5pdH0gcmVjdEluaXQgLSBEYXRhIG9mIHRoZSBlbGVtZW50J3MgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFJlc2l6ZU9ic2VydmVyRW50cnkodGFyZ2V0LCByZWN0SW5pdCkge1xyXG4gICAgICAgIHZhciBjb250ZW50UmVjdCA9IGNyZWF0ZVJlYWRPbmx5UmVjdChyZWN0SW5pdCk7XHJcbiAgICAgICAgLy8gQWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpY2F0aW9uIGZvbGxvd2luZyBwcm9wZXJ0aWVzIGFyZSBub3Qgd3JpdGFibGVcclxuICAgICAgICAvLyBhbmQgYXJlIGFsc28gbm90IGVudW1lcmFibGUgaW4gdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbi5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFByb3BlcnR5IGFjY2Vzc29ycyBhcmUgbm90IGJlaW5nIHVzZWQgYXMgdGhleSdkIHJlcXVpcmUgdG8gZGVmaW5lIGFcclxuICAgICAgICAvLyBwcml2YXRlIFdlYWtNYXAgc3RvcmFnZSB3aGljaCBtYXkgY2F1c2UgbWVtb3J5IGxlYWtzIGluIGJyb3dzZXJzIHRoYXRcclxuICAgICAgICAvLyBkb24ndCBzdXBwb3J0IHRoaXMgdHlwZSBvZiBjb2xsZWN0aW9ucy5cclxuICAgICAgICBkZWZpbmVDb25maWd1cmFibGUodGhpcywgeyB0YXJnZXQ6IHRhcmdldCwgY29udGVudFJlY3Q6IGNvbnRlbnRSZWN0IH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmVyRW50cnk7XHJcbn0oKSk7XG5cbnZhciBSZXNpemVPYnNlcnZlclNQSSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlci5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1Jlc2l6ZU9ic2VydmVyQ2FsbGJhY2t9IGNhbGxiYWNrIC0gQ2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBpcyBpbnZva2VkXHJcbiAgICAgKiAgICAgIHdoZW4gb25lIG9mIHRoZSBvYnNlcnZlZCBlbGVtZW50cyBjaGFuZ2VzIGl0J3MgY29udGVudCBkaW1lbnNpb25zLlxyXG4gICAgICogQHBhcmFtIHtSZXNpemVPYnNlcnZlckNvbnRyb2xsZXJ9IGNvbnRyb2xsZXIgLSBDb250cm9sbGVyIGluc3RhbmNlIHdoaWNoXHJcbiAgICAgKiAgICAgIGlzIHJlc3BvbnNpYmxlIGZvciB0aGUgdXBkYXRlcyBvZiBvYnNlcnZlci5cclxuICAgICAqIEBwYXJhbSB7UmVzaXplT2JzZXJ2ZXJ9IGNhbGxiYWNrQ3R4IC0gUmVmZXJlbmNlIHRvIHRoZSBwdWJsaWNcclxuICAgICAqICAgICAgUmVzaXplT2JzZXJ2ZXIgaW5zdGFuY2Ugd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gY2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFJlc2l6ZU9ic2VydmVyU1BJKGNhbGxiYWNrLCBjb250cm9sbGVyLCBjYWxsYmFja0N0eCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbGxlY3Rpb24gb2YgcmVzaXplIG9ic2VydmF0aW9ucyB0aGF0IGhhdmUgZGV0ZWN0ZWQgY2hhbmdlcyBpbiBkaW1lbnNpb25zXHJcbiAgICAgICAgICogb2YgZWxlbWVudHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7QXJyYXk8UmVzaXplT2JzZXJ2YXRpb24+fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYWN0aXZlT2JzZXJ2YXRpb25zXyA9IFtdO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdHJ5IG9mIHRoZSBSZXNpemVPYnNlcnZhdGlvbiBpbnN0YW5jZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7TWFwPEVsZW1lbnQsIFJlc2l6ZU9ic2VydmF0aW9uPn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9ic2VydmF0aW9uc18gPSBuZXcgTWFwU2hpbSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGNhbGxiYWNrIHByb3ZpZGVkIGFzIHBhcmFtZXRlciAxIGlzIG5vdCBhIGZ1bmN0aW9uLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGxiYWNrXyA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuY29udHJvbGxlcl8gPSBjb250cm9sbGVyO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tDdHhfID0gY2FsbGJhY2tDdHg7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyBvYnNlcnZpbmcgcHJvdmlkZWQgZWxlbWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgdG8gYmUgb2JzZXJ2ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJTUEkucHJvdG90eXBlLm9ic2VydmUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJzEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3QgaGF2ZSB0aGUgRWxlbWVudCBpbnRlcmZhY2UuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJyB8fCAhKEVsZW1lbnQgaW5zdGFuY2VvZiBPYmplY3QpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgZ2V0V2luZG93T2YodGFyZ2V0KS5FbGVtZW50KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwYXJhbWV0ZXIgMSBpcyBub3Qgb2YgdHlwZSBcIkVsZW1lbnRcIi4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9ic2VydmF0aW9ucyA9IHRoaXMub2JzZXJ2YXRpb25zXztcclxuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIGVsZW1lbnQgaXMgYWxyZWFkeSBiZWluZyBvYnNlcnZlZC5cclxuICAgICAgICBpZiAob2JzZXJ2YXRpb25zLmhhcyh0YXJnZXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JzZXJ2YXRpb25zLnNldCh0YXJnZXQsIG5ldyBSZXNpemVPYnNlcnZhdGlvbih0YXJnZXQpKTtcclxuICAgICAgICB0aGlzLmNvbnRyb2xsZXJfLmFkZE9ic2VydmVyKHRoaXMpO1xyXG4gICAgICAgIC8vIEZvcmNlIHRoZSB1cGRhdGUgb2Ygb2JzZXJ2YXRpb25zLlxyXG4gICAgICAgIHRoaXMuY29udHJvbGxlcl8ucmVmcmVzaCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RvcHMgb2JzZXJ2aW5nIHByb3ZpZGVkIGVsZW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgLSBFbGVtZW50IHRvIHN0b3Agb2JzZXJ2aW5nLlxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyU1BJLnByb3RvdHlwZS51bm9ic2VydmUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJzEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3QgaGF2ZSB0aGUgRWxlbWVudCBpbnRlcmZhY2UuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJyB8fCAhKEVsZW1lbnQgaW5zdGFuY2VvZiBPYmplY3QpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgZ2V0V2luZG93T2YodGFyZ2V0KS5FbGVtZW50KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwYXJhbWV0ZXIgMSBpcyBub3Qgb2YgdHlwZSBcIkVsZW1lbnRcIi4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9ic2VydmF0aW9ucyA9IHRoaXMub2JzZXJ2YXRpb25zXztcclxuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIGVsZW1lbnQgaXMgbm90IGJlaW5nIG9ic2VydmVkLlxyXG4gICAgICAgIGlmICghb2JzZXJ2YXRpb25zLmhhcyh0YXJnZXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZSh0YXJnZXQpO1xyXG4gICAgICAgIGlmICghb2JzZXJ2YXRpb25zLnNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyXy5yZW1vdmVPYnNlcnZlcih0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wcyBvYnNlcnZpbmcgYWxsIGVsZW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlclNQSS5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsZWFyQWN0aXZlKCk7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZhdGlvbnNfLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9sbGVyXy5yZW1vdmVPYnNlcnZlcih0aGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbGxlY3RzIG9ic2VydmF0aW9uIGluc3RhbmNlcyB0aGUgYXNzb2NpYXRlZCBlbGVtZW50IG9mIHdoaWNoIGhhcyBjaGFuZ2VkXHJcbiAgICAgKiBpdCdzIGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlclNQSS5wcm90b3R5cGUuZ2F0aGVyQWN0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jbGVhckFjdGl2ZSgpO1xyXG4gICAgICAgIHRoaXMub2JzZXJ2YXRpb25zXy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZhdGlvbikge1xyXG4gICAgICAgICAgICBpZiAob2JzZXJ2YXRpb24uaXNBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuYWN0aXZlT2JzZXJ2YXRpb25zXy5wdXNoKG9ic2VydmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogSW52b2tlcyBpbml0aWFsIGNhbGxiYWNrIGZ1bmN0aW9uIHdpdGggYSBsaXN0IG9mIFJlc2l6ZU9ic2VydmVyRW50cnlcclxuICAgICAqIGluc3RhbmNlcyBjb2xsZWN0ZWQgZnJvbSBhY3RpdmUgcmVzaXplIG9ic2VydmF0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJTUEkucHJvdG90eXBlLmJyb2FkY2FzdEFjdGl2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIG9ic2VydmVyIGRvZXNuJ3QgaGF2ZSBhY3RpdmUgb2JzZXJ2YXRpb25zLlxyXG4gICAgICAgIGlmICghdGhpcy5oYXNBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjdHggPSB0aGlzLmNhbGxiYWNrQ3R4XztcclxuICAgICAgICAvLyBDcmVhdGUgUmVzaXplT2JzZXJ2ZXJFbnRyeSBpbnN0YW5jZSBmb3IgZXZlcnkgYWN0aXZlIG9ic2VydmF0aW9uLlxyXG4gICAgICAgIHZhciBlbnRyaWVzID0gdGhpcy5hY3RpdmVPYnNlcnZhdGlvbnNfLm1hcChmdW5jdGlvbiAob2JzZXJ2YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXNpemVPYnNlcnZlckVudHJ5KG9ic2VydmF0aW9uLnRhcmdldCwgb2JzZXJ2YXRpb24uYnJvYWRjYXN0UmVjdCgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrXy5jYWxsKGN0eCwgZW50cmllcywgY3R4KTtcclxuICAgICAgICB0aGlzLmNsZWFyQWN0aXZlKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIGNvbGxlY3Rpb24gb2YgYWN0aXZlIG9ic2VydmF0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJTUEkucHJvdG90eXBlLmNsZWFyQWN0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlT2JzZXJ2YXRpb25zXy5zcGxpY2UoMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxscyB3aGV0aGVyIG9ic2VydmVyIGhhcyBhY3RpdmUgb2JzZXJ2YXRpb25zLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlclNQSS5wcm90b3R5cGUuaGFzQWN0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU9ic2VydmF0aW9uc18ubGVuZ3RoID4gMDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUmVzaXplT2JzZXJ2ZXJTUEk7XHJcbn0oKSk7XG5cbi8vIFJlZ2lzdHJ5IG9mIGludGVybmFsIG9ic2VydmVycy4gSWYgV2Vha01hcCBpcyBub3QgYXZhaWxhYmxlIHVzZSBjdXJyZW50IHNoaW1cclxuLy8gZm9yIHRoZSBNYXAgY29sbGVjdGlvbiBhcyBpdCBoYXMgYWxsIHJlcXVpcmVkIG1ldGhvZHMgYW5kIGJlY2F1c2UgV2Vha01hcFxyXG4vLyBjYW4ndCBiZSBmdWxseSBwb2x5ZmlsbGVkIGFueXdheS5cclxudmFyIG9ic2VydmVycyA9IHR5cGVvZiBXZWFrTWFwICE9PSAndW5kZWZpbmVkJyA/IG5ldyBXZWFrTWFwKCkgOiBuZXcgTWFwU2hpbSgpO1xyXG4vKipcclxuICogUmVzaXplT2JzZXJ2ZXIgQVBJLiBFbmNhcHN1bGF0ZXMgdGhlIFJlc2l6ZU9ic2VydmVyIFNQSSBpbXBsZW1lbnRhdGlvblxyXG4gKiBleHBvc2luZyBvbmx5IHRob3NlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgdGhhdCBhcmUgZGVmaW5lZCBpbiB0aGUgc3BlYy5cclxuICovXHJcbnZhciBSZXNpemVPYnNlcnZlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlci5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1Jlc2l6ZU9ic2VydmVyQ2FsbGJhY2t9IGNhbGxiYWNrIC0gQ2FsbGJhY2sgdGhhdCBpcyBpbnZva2VkIHdoZW5cclxuICAgICAqICAgICAgZGltZW5zaW9ucyBvZiB0aGUgb2JzZXJ2ZWQgZWxlbWVudHMgY2hhbmdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBSZXNpemVPYnNlcnZlcihjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSZXNpemVPYnNlcnZlcikpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignMSBhcmd1bWVudCByZXF1aXJlZCwgYnV0IG9ubHkgMCBwcmVzZW50LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29udHJvbGxlciA9IFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5nZXRJbnN0YW5jZSgpO1xyXG4gICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlclNQSShjYWxsYmFjaywgY29udHJvbGxlciwgdGhpcyk7XHJcbiAgICAgICAgb2JzZXJ2ZXJzLnNldCh0aGlzLCBvYnNlcnZlcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUmVzaXplT2JzZXJ2ZXI7XHJcbn0oKSk7XHJcbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcyBvZiBSZXNpemVPYnNlcnZlci5cclxuW1xyXG4gICAgJ29ic2VydmUnLFxyXG4gICAgJ3Vub2JzZXJ2ZScsXHJcbiAgICAnZGlzY29ubmVjdCdcclxuXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcclxuICAgIFJlc2l6ZU9ic2VydmVyLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICByZXR1cm4gKF9hID0gb2JzZXJ2ZXJzLmdldCh0aGlzKSlbbWV0aG9kXS5hcHBseShfYSwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn0pO1xuXG52YXIgaW5kZXggPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gRXhwb3J0IGV4aXN0aW5nIGltcGxlbWVudGF0aW9uIGlmIGF2YWlsYWJsZS5cclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsJDEuUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbCQxLlJlc2l6ZU9ic2VydmVyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmVyO1xyXG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBpbmRleDtcbiIsImltcG9ydCB7IGJ1YmJsZSwgbGlzdGVuIH0gZnJvbSBcInN2ZWx0ZS9pbnRlcm5hbFwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV2ZW50c0FjdGlvbihjb21wb25lbnQpIHtcbiAgcmV0dXJuIChub2RlKSA9PiB7XG4gICAgY29uc3QgZXZlbnRzID0gT2JqZWN0LmtleXMoY29tcG9uZW50LiQkLmNhbGxiYWNrcyk7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gW107XG5cbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IGxpc3RlbmVycy5wdXNoKGxpc3Rlbihub2RlLCBldmVudCwgKGUpID0+IGJ1YmJsZShjb21wb25lbnQsIGUpKSkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Ryb3k6ICgpID0+IHtcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfTtcbn1cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlIH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBvcmllbnRhdGlvblxuICAgKiBAdHlwZSB7XCJob3Jpem9udGFsXCIgfCBcInZlcnRpY2FsXCJ9W29yaWVudGF0aW9uPVwiaG9yaXpvbnRhbFwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBvcmllbnRhdGlvbiA9IFwiaG9yaXpvbnRhbFwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSB2YXJpYW50cyBvZiBhY3Rpb24gZ3JvdXBcbiAgICogQHR5cGUge1wiZ2VuZXJhbFwiIHwgXCJqdXN0aWZpZWRcIn1bdmFyaWFudHMgPSBcImp1c3RpZmllZFwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCB2YXJpYW50cyA9IFwiZ2VuZXJhbFwiO1xuXG4gIC8qKlxuICAgKiBXaGVuIHZhcmlhbnRzPT09XCJqdXN0aWZpZWRcIiwgc2V0IGl0cyBkaW1lbnNpb27jgIJcbiAgICogQHR5cGUge0RpbWVuc2lvbn1bZGltZW5zaW9uID0gXCJcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGltZW5zaW9uID0gXCJcIjtcblxuICAvKipcbiAgICogSXMgaXQgYSBvbmx5IGljb24gb2YgYWN0aW9uIGdyb3VwXG4gICAqIEB0eXBlIHtib29sZWFufVtvbmx5SWNvbj1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgb25seUljb24gPSBmYWxzZTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgYWN0aW9uIGdyb3VwIGlzIGluIHF1aWV0IHN0YXRlXG4gICAqIEB0eXBlIHtib29sZWFufVtpc1F1aWV0PWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc1F1aWV0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGFjdGlvbiBncm91cCBpcyBpbiBjb21wYWN0IHN0YXRlXG4gICAqIEB0eXBlIHtib29sZWFufVtpc0NvbXBhY3Q9ZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzQ29tcGFjdCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBlbXBoYXNpemVkIHN0YXR1cyBvZiBidXR0b24gZ3JvdXBcbiAgICogQHR5cGUgeyBib29sZWFuIH0gW2VtcGhhc2l6ZWQ9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBlbXBoYXNpemVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIERpc2FibGUgYWxsIGFjdGlvbiBidXR0b25zXG4gICAqIEB0eXBlIHtib29sZWFufVtkaXNhYmxlZD1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcblxuICBsZXQgYWN0aW9uR3JvdXA7XG4gIGZ1bmN0aW9uIGFkZENoaWxkQ2xhc3NOYW1lKCkge1xuICAgIGxldCBidXR0b25DbGFzc05hbWUgPSBbXG4gICAgICBcIiBzcGVjdHJ1bS1BY3Rpb25Hcm91cC1pdGVtXCIsXG4gICAgICBpc1F1aWV0ICYmIFwic3BlY3RydW0tQWN0aW9uQnV0dG9uLS1xdWlldFwiLFxuICAgICAgZW1waGFzaXplZCAmJiBcInNwZWN0cnVtLUFjdGlvbkJ1dHRvbi0tZW1waGFzaXplZFwiLFxuICAgIF1cbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgIC5qb2luKFwiIFwiKTtcbiAgICBpZiAoYWN0aW9uR3JvdXApIHtcbiAgICAgIGNvbnN0IGJ1dHRvbkl0ZW0gPSBhY3Rpb25Hcm91cC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3BlY3RydW0tQWN0aW9uQnV0dG9uXCIpO1xuICAgICAgaWYgKGJ1dHRvbkl0ZW0ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBidXR0b25JdGVtLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgYnV0dG9uSXRlbVtpbmRleF0uc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgZGlzYWJsZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBidXR0b25JdGVtW2luZGV4XS5jbGFzc05hbWUgPSBidXR0b25JdGVtW2luZGV4XS5jbGFzc05hbWUgKyBidXR0b25DbGFzc05hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvbmx5SWNvbiAmJiB2YXJpYW50cyA9PT0gXCJnZW5lcmFsXCIpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uV3JhcEl0ZW0gPSBhY3Rpb25Hcm91cC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3BlY3RydW0tQnV0dG9uLXdyYXBcIik7XG4gICAgICAgIGlmIChidXR0b25XcmFwSXRlbS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYnV0dG9uV3JhcEl0ZW0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBidXR0b25XcmFwSXRlbVtpbmRleF0uY2xhc3NOYW1lID0gYnV0dG9uV3JhcEl0ZW1baW5kZXhdLmNsYXNzTmFtZSArIFwiIHJ1YnVzLWJ1dHRvbi13cmFwXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWZ0ZXJVcGRhdGUoKCkgPT4ge1xuICAgIGFkZENoaWxkQ2xhc3NOYW1lKCk7XG4gIH0pO1xuXG4gICQ6IHN0eWxlQ3NzVGV4dCA9IFtcbiAgICB2YXJpYW50cyA9PT0gXCJqdXN0aWZpZWRcIiAmJlxuICAgICAgb3JpZW50YXRpb24gPT09IFwiaG9yaXpvbnRhbFwiICYmXG4gICAgICBgd2lkdGg6dmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi0ke2RpbWVuc2lvbn0sIHZhcigtLXNwZWN0cnVtLWFsaWFzLSR7ZGltZW5zaW9ufSkpYCxcbiAgICB2YXJpYW50cyA9PT0gXCJqdXN0aWZpZWRcIiAmJlxuICAgICAgb3JpZW50YXRpb24gPT09IFwidmVydGljYWxcIiAmJlxuICAgICAgYGhlaWdodDp2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLSR7ZGltZW5zaW9ufSwgdmFyKC0tc3BlY3RydW0tYWxpYXMtJHtkaW1lbnNpb259KSlgLFxuICBdXG4gICAgLmZpbHRlcihCb29sZWFuKVxuICAgIC5qb2luKFwiIFwiKTtcbjwvc2NyaXB0PlxuXG48ZGl2XG4gIGNsYXNzPVwic3BlY3RydW0tQWN0aW9uR3JvdXBcIlxuICBzdHlsZT17c3R5bGVDc3NUZXh0fVxuICBjbGFzczpzcGVjdHJ1bS1BY3Rpb25Hcm91cC0tanVzdGlmaWVkPXt2YXJpYW50cyA9PT0gJ2p1c3RpZmllZCd9XG4gIGNsYXNzOnNwZWN0cnVtLUFjdGlvbkdyb3VwLS12ZXJ0aWNhbD17b3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCd9XG4gIGNsYXNzOnNwZWN0cnVtLUFjdGlvbkdyb3VwLS1xdWlldD17aXNRdWlldH1cbiAgY2xhc3M6c3BlY3RydW0tQWN0aW9uR3JvdXAtLWNvbXBhY3Q9e2lzQ29tcGFjdH1cbiAgYmluZDp0aGlzPXthY3Rpb25Hcm91cH0+XG4gIDxzbG90IC8+XG48L2Rpdj5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGN1cnJlbnRfY29tcG9uZW50IH0gZnJvbSBcInN2ZWx0ZS9pbnRlcm5hbFwiO1xuICBpbXBvcnQgeyBnZXRFdmVudHNBY3Rpb24gfSBmcm9tIFwiLi4vdXRpbHMvZ2V0LWV2ZW50cy1hY3Rpb24uanNcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgdGFiaW5kZXhcbiAgICogQHR5cGUge3N0cmluZ31bdGFiaW5kZXg9XCIwXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHRhYmluZGV4ID0gMDtcblxuICAvKipcbiAgICogU2V0IHRvIGB0cnVlYCB0byBkaXNhYmxlIHRoZSBidXR0b25cbiAgICogQHR5cGUge2Jvb2xlYW59W2Rpc2FibGVkPWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBpZFxuICAgKiBAdHlwZSB7c3RyaW5nfVtpZD1cIlwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpZCA9IFwiXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGFyaWEtbGFiZWxcbiAgICogQHR5cGUge3N0cmluZ30gW2FyaWEtbGFiZWw9XCJidXR0b25cIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgYXJpYUxhYmVsID0gXCJidXR0b25cIjtcblxuICAvKipcbiAgICogU2V0IHRoZSBgaHJlZmAgdG8gdXNlIGFuIGFuY2hvciBsaW5rXG4gICAqIEB0eXBlIHtzdHJpbmd9W2hyZWYgPSBcIlwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBocmVmID0gXCJcIjtcbiAgLyoqXG4gICAqIFByZWNvbmRpdGlvbnM6IGhyZWZcbiAgICogV2hlcmUgdG8gZGlzcGxheSB0aGUgbGlua2VkIFVSTFxuICAgKiBAdHlwZSB7XCJfc2VsZlwiIHwgXCJfYmxhbmtcIiB8IFwiX3BhcmVudFwiIHwgXCJfdG9wXCJ9W3RhcmdldCA9IFwiXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHRhcmdldCA9IFwiXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGB0eXBlYCBhdHRyaWJ1dGUgZm9yIHRoZSBidXR0b24gZWxlbWVudFxuICAgKiBAdHlwZSB7XCJidXR0b25cInxcInN1Ym1pdFwifFwicmVzZXRcIn1bdHlwZT1cImJ1dHRvblwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCB0eXBlID0gXCJidXR0b25cIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZXh0ZXJpb3Igb2YgYnV0dG9uXG4gICAqIEB0eXBlIHtcImdlbmVyYWxcIiB8IFwiY2xlYXJcIiB8IFwibG9naWMtb3JcIiB8IFwibG9naWMtYW5kXCIgIHxcImFjdGlvblwifSBbZXh0ZXJpb3I9XCJnZW5lcmFsXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGV4dGVyaW9yID0gXCJnZW5lcmFsXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHZhcmlhbnQgb2YgYnV0dG9uXG4gICAqIEB0eXBlIHtcImN0YVwiIHwgXCJvdmVyQmFja2dyb3VuZFwiIHwgXCJwcmltYXJ5XCIgfCBcInNlY29uZGFyeVwiIHwgXCJ3YXJuaW5nXCJ9IFt2YXJpYW50PVwiY3RhXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHZhcmlhbnQgPSBcImN0YVwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBxdWlldCBtb2RlIG9mIGJ1dHRvblxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNRdWlldD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzUXVpZXQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgc2VsZWN0ZWQgc3RhdHVzIG9mIGJ1dHRvblxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNTZWxlY3RlZD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzU2VsZWN0ZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogUHJlY29uZGl0aW9uczogZXh0ZXJpb3IgPT09IFwiY2xlYXJcIlxuICAgKiBTcGVjaWZ5IHRoZSBzbWFsbCBtb2RlIG9mIGJ1dHRvblxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNTbWFsbD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzU21hbGwgPSBmYWxzZTtcblxuICAvKipcbiAgICogUHJlY29uZGl0aW9uczogZXh0ZXJpb3IgPT09IFwiYWN0aW9uXCJcbiAgICogU3BlY2lmeSB0aGUgZW1waGFzaXplZCBzdGF0dXMgb2YgYnV0dG9uXG4gICAqIEB0eXBlIHsgYm9vbGVhbiB9IFtlbXBoYXNpemVkPSBmYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZW1waGFzaXplZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBQcmVjb25kaXRpb25zOiBkaXNhYmxlZCA9PT0gdHJ1ZVxuICAgKiBDdXJzb3Igbm90LWFsbG93ZWQgd2hlbiB0aGUgYnV0dG9uIGlzIGRpc2FibGVkXG4gICAqIEB0eXBlIHsgYm9vbGVhbiB9IFtub3RBbGxvd2VkPSBmYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgbm90QWxsb3dlZCA9IGZhbHNlO1xuXG4gIGNvbnN0IGV2ZW50c0xpc3RlbiA9IGdldEV2ZW50c0FjdGlvbihjdXJyZW50X2NvbXBvbmVudCk7XG4gICQ6IGJ1dHRvblByb3BzID0ge1xuICAgIGlkLFxuICAgIHR5cGUsXG4gICAgcm9sZTogXCJidXR0b25cIixcbiAgICB0YWJpbmRleCxcbiAgICBkaXNhYmxlZCxcbiAgICAuLi4kJHJlc3RQcm9wcyxcbiAgICBjbGFzczogW1xuICAgICAgZXh0ZXJpb3IgPT09IFwiZ2VuZXJhbFwiICYmIFwic3BlY3RydW0tQnV0dG9uXCIsXG4gICAgICBleHRlcmlvciA9PT0gXCJnZW5lcmFsXCIgJiYgYHNwZWN0cnVtLUJ1dHRvbi0tJHt2YXJpYW50fWAsXG4gICAgICBleHRlcmlvciA9PT0gXCJnZW5lcmFsXCIgJiYgaXNRdWlldCAmJiBgc3BlY3RydW0tQnV0dG9uLS1xdWlldGAsXG4gICAgICBleHRlcmlvciA9PT0gXCJjbGVhclwiICYmIFwic3BlY3RydW0tQ2xlYXJCdXR0b25cIixcbiAgICAgIGV4dGVyaW9yID09PSBcImNsZWFyXCIgJiYgYHNwZWN0cnVtLUNsZWFyQnV0dG9uLS0ke3ZhcmlhbnR9YCxcbiAgICAgIGV4dGVyaW9yID09PSBcImNsZWFyXCIgJiYgKGlzU21hbGwgPyBcInNwZWN0cnVtLUNsZWFyQnV0dG9uLS1zbWFsbFwiIDogXCJzcGVjdHJ1bS1DbGVhckJ1dHRvbi0tbWVkaXVtXCIpLFxuICAgICAgZXh0ZXJpb3IgPT09IFwibG9naWMtb3JcIiAmJiBcInNwZWN0cnVtLUxvZ2ljQnV0dG9uIHNwZWN0cnVtLUxvZ2ljQnV0dG9uLS1vclwiLFxuICAgICAgZXh0ZXJpb3IgPT09IFwibG9naWMtYW5kXCIgJiYgXCJzcGVjdHJ1bS1Mb2dpY0J1dHRvbiBzcGVjdHJ1bS1Mb2dpY0J1dHRvbi0tYW5kXCIsXG4gICAgICBleHRlcmlvciA9PT0gXCJhY3Rpb25cIiAmJiBcInNwZWN0cnVtLUFjdGlvbkJ1dHRvblwiLFxuICAgICAgZXh0ZXJpb3IgPT09IFwiYWN0aW9uXCIgJiYgaXNRdWlldCAmJiBgc3BlY3RydW0tQWN0aW9uQnV0dG9uLS1xdWlldGAsXG4gICAgICBleHRlcmlvciA9PT0gXCJhY3Rpb25cIiAmJiBlbXBoYXNpemVkICYmIFwic3BlY3RydW0tQWN0aW9uQnV0dG9uLS1lbXBoYXNpemVkXCIsXG4gICAgICBpc1NlbGVjdGVkICYmIFwiaXMtc2VsZWN0ZWRcIixcbiAgICAgIGRpc2FibGVkICYmIG5vdEFsbG93ZWQgJiYgXCJub3QtYWxsb3dlZFwiLFxuICAgICAgYCR7JCRyZXN0UHJvcHMuY2xhc3N9YCxcbiAgICBdXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAuam9pbihcIiBcIiksXG4gIH07XG48L3NjcmlwdD5cblxuPHN0eWxlIGdsb2JhbD5cbiAgLm5vdC1hbGxvd2VkOmRpc2FibGVkIHtcbiAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICB9XG48L3N0eWxlPlxuXG57I2lmIGhyZWZ9XG4gIDxhIHsuLi5idXR0b25Qcm9wc30gYXJpYS1sYWJlbD17YXJpYUxhYmVsfSB7aHJlZn0ge3RhcmdldH0gdXNlOmV2ZW50c0xpc3Rlbj5cbiAgICB7I2lmIGV4dGVyaW9yID09ICdjbGVhcicgfHwgZXh0ZXJpb3IgPT0gJ2xvZ2ljLW9yJyB8fCBleHRlcmlvciA9PSAnbG9naWMtYW5kJ31cbiAgICAgIDxzbG90IC8+XG4gICAgezplbHNlfVxuICAgICAgPHNsb3QgbmFtZT1cImJ1dHRvbi1pY29uXCIgLz5cbiAgICAgIDxzcGFuIGNsYXNzPVwic3BlY3RydW0te2V4dGVyaW9yID09ICdhY3Rpb24nID8gJ0FjdGlvbkJ1dHRvbicgOiAnQnV0dG9uJ30tbGFiZWxcIj5cbiAgICAgICAgPHNsb3QgLz5cbiAgICAgIDwvc3Bhbj5cbiAgICB7L2lmfVxuICA8L2E+XG57OmVsc2V9XG4gIDxidXR0b24gey4uLmJ1dHRvblByb3BzfSBhcmlhLWxhYmVsPXthcmlhTGFiZWx9IHVzZTpldmVudHNMaXN0ZW4+XG4gICAgeyNpZiBleHRlcmlvciA9PSAnY2xlYXInIHx8IGV4dGVyaW9yID09ICdsb2dpYy1vcicgfHwgZXh0ZXJpb3IgPT0gJ2xvZ2ljLWFuZCd9XG4gICAgICA8c2xvdCAvPlxuICAgIHs6ZWxzZX1cbiAgICAgIDxzbG90IG5hbWU9XCJidXR0b24taWNvblwiIC8+XG4gICAgICA8c3BhbiBjbGFzcz1cInNwZWN0cnVtLXtleHRlcmlvciA9PSAnYWN0aW9uJyA/ICdBY3Rpb25CdXR0b24nIDogJ0J1dHRvbid9LWxhYmVsXCI+XG4gICAgICAgIDxzbG90IC8+XG4gICAgICA8L3NwYW4+XG4gICAgey9pZn1cbiAgPC9idXR0b24+XG57L2lmfVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldFJlY3QoZWxlbWVudCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB0b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcDtcbiAgdmFyIGxlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50TGVmdDtcblxuICByZXR1cm4ge1xuICAgIHRvcDogcmVjdC50b3AgLSB0b3AsXG4gICAgYm90dG9tOiBNYXRoLmFicyhyZWN0LmJvdHRvbSAtIHRvcCksXG4gICAgbGVmdDogcmVjdC5sZWZ0IC0gbGVmdCxcbiAgICByaWdodDogTWF0aC5hYnMocmVjdC5yaWdodCAtIGxlZnQpLFxuICAgIHg6IHJlY3QueCxcbiAgICB5OiByZWN0LnksXG4gICAgd2lkdGg6IHJlY3Qud2lkdGggfHwgZWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0IHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5UaGVCb3hQb3NpdGlvbihwcmV2Tm9kZSwgdGFyZ2V0Tm9kZSkge1xuICBsZXQgcG9zV2lkdGggPSAwO1xuICBsZXQgcG9zSGVpZ2h0ID0gMDtcbiAgbGV0IGNoaWxkTm9kZXNMaXN0ID0gcHJldk5vZGUuY2hpbGROb2RlcztcbiAgbGV0IHRhcmdldEluZGV4ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCh0YXJnZXROb2RlLnBhcmVudE5vZGUuY2hpbGROb2RlcywgdGFyZ2V0Tm9kZSk7XG5cbiAgaWYgKHRhcmdldEluZGV4KSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRhcmdldEluZGV4OyBpbmRleCsrKSB7XG4gICAgICBpZiAoY2hpbGROb2Rlc0xpc3RbaW5kZXhdLnRhZ05hbWUpIHtcbiAgICAgICAgcG9zV2lkdGggPSBnZXRSZWN0KGNoaWxkTm9kZXNMaXN0W2luZGV4XSkud2lkdGggKyBwb3NXaWR0aDtcbiAgICAgICAgcG9zSGVpZ2h0ID0gZ2V0UmVjdChjaGlsZE5vZGVzTGlzdFtpbmRleF0pLmhlaWdodCArIHBvc0hlaWdodDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gW3Bvc1dpZHRoLnRvRml4ZWQoMiksIHBvc0hlaWdodC50b0ZpeGVkKDIpXTtcbn1cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBnZXRSZWN0IH0gZnJvbSBcIi4uL3V0aWxzL2VsZW1lbnQuanNcIjtcblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgcG9wb3ZlciBpcyBvcGVuXG4gICAqIEB0eXBlIHtib29sZWFufVtpc09wZW49ZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzT3BlbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSAgdmFyaWFudHMgb2YgcG9wdmVyXG4gICAqIEB0eXBlIHtcIm1lbnVcInxcImRpYWxvZ1wifVt2YXJpYW50cyA9IFwibWVudVwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCB2YXJpYW50cyA9IFwibWVudVwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSAgcG9zaXRpb24gbW9kZSBvZiBwb3B2ZXJcbiAgICogdmFyaWFudHMgPT4gXCJtZW51XCIgQHR5cGUgeyBcImF1dG9cInxcInRvcExlZnRcInxcInRvcFJpZ2h0XCJ8XCJib3R0b21MZWZ0XCJ8XCJib3R0b21SaWdodFwiXCJsZWZ0VG9wXCJ8XCJyaWdodFRvcFwifFwibGVmdEJvdHRvbVwifFwicmlnaHRCb3R0b21cIn0gWyBwb3B2ZXJQb3NpdGlvbiA9IFwiYXV0b1wiXVxuICAgKiB2YXJpYW50cyA9PiBcImRpYWxvZ1wiIEB0eXBlIHsgXCJjZW50ZXJMZWZ0XCJ8XCJjZW50ZXJSaWdodFwifFwiY2VudGVyVG9wXCJ8XCJjZW50ZXJCb3R0b21cIiB9XG4gICAqL1xuICBleHBvcnQgbGV0IHBvcHZlclBvc2l0aW9uID0gXCJhdXRvXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlICBxdWl0ZSBtb2RlIG9mIHBvcHZlclxuICAgKiBAdHlwZSB7Ym9vbGVhbn1baXNPcGVuPWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc1F1aWV0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlICB0aXRsZSBvZiBwb3B2ZXJcbiAgICogQHR5cGUge3N0cmluZ31bdGl0bGUgPSBcIlBvcG92ZXIgVGl0bGVcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgdGl0bGUgPSBcIlBvcG92ZXIgVGl0bGVcIjtcblxuICBsZXQgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJib3R0b21SaWdodFwiO1xuXG4gIGxldCBwb3BvdmVyO1xuICBsZXQgcG9wb3ZlclRpcDtcbiAgbGV0IG1lbnVCdXR0b247XG4gIGxldCBtZW51QnV0dG9uV2lkdGg7XG4gIGxldCBtZW51QnV0dG9uSGVpZ2h0O1xuICBsZXQgcG9wb3ZlcldpZHRoO1xuICBsZXQgcG9wb3ZlckhlaWdodDtcbiAgbGV0IHBvcG92ZXJUaXBXaWR0aDtcbiAgbGV0IHBvcG92ZXJUaXBIZWlnaHQ7XG5cbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgc2V0Q3NzVmFyKCk7XG4gIH0pO1xuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgYXV0b1BsYWNlKCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNldENzc1ZhcigpIHtcbiAgICBpZiAoIXBvcG92ZXIucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI3J1YnVzLUFjdGlvblNvdXJjZVwiKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtZW51QnV0dG9uID0gZ2V0UmVjdChwb3BvdmVyLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiNydWJ1cy1BY3Rpb25Tb3VyY2VcIikpO1xuICAgIG1lbnVCdXR0b25XaWR0aCA9IG1lbnVCdXR0b24gJiYgbWVudUJ1dHRvbi53aWR0aDtcbiAgICBtZW51QnV0dG9uSGVpZ2h0ID0gbWVudUJ1dHRvbiAmJiBtZW51QnV0dG9uLmhlaWdodDtcbiAgICBwb3BvdmVyV2lkdGggPSBwb3BvdmVyICYmIHBvcG92ZXIub2Zmc2V0V2lkdGg7XG4gICAgcG9wb3ZlckhlaWdodCA9IHBvcG92ZXIgJiYgcG9wb3Zlci5vZmZzZXRIZWlnaHQ7XG4gICAgcG9wb3ZlclRpcFdpZHRoID0gcG9wb3ZlclRpcCAmJiBwb3BvdmVyVGlwLm9mZnNldFdpZHRoO1xuICAgIHBvcG92ZXJUaXBIZWlnaHQgPSBwb3BvdmVyVGlwICYmIHBvcG92ZXJUaXAub2Zmc2V0SGVpZ2h0O1xuXG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGhcIiwgbWVudUJ1dHRvbldpZHRoICsgYHB4YCk7XG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0XCIsIG1lbnVCdXR0b25IZWlnaHQgKyBgcHhgKTtcbiAgICBwb3BvdmVyLnBhcmVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGhcIiwgcG9wb3ZlcldpZHRoICsgYHB4YCk7XG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodFwiLCBwb3BvdmVySGVpZ2h0ICsgYHB4YCk7XG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC13aWR0aFwiLCBwb3BvdmVyVGlwV2lkdGggKyBgcHhgKTtcbiAgICBwb3BvdmVyLnBhcmVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodFwiLCBwb3BvdmVyVGlwSGVpZ2h0ICsgYHB4YCk7XG4gIH1cblxuICBmdW5jdGlvbiBhdXRvUGxhY2UoKSB7XG4gICAgaWYgKHZhcmlhbnRzID09IFwibWVudVwiKSB7XG4gICAgICBzd2l0Y2ggKHBvcHZlclBvc2l0aW9uID09IFwiYXV0b1wiKSB7XG4gICAgICAgIGNhc2UgbWVudUJ1dHRvbi54ID4gcG9wb3ZlcldpZHRoICYmXG4gICAgICAgICAgbWVudUJ1dHRvbi55ID4gcG9wb3ZlckhlaWdodCAmJlxuICAgICAgICAgIG1lbnVCdXR0b24ucmlnaHQgPCBwb3BvdmVyV2lkdGggJiZcbiAgICAgICAgICBtZW51QnV0dG9uLmJvdHRvbSA8IHBvcG92ZXJIZWlnaHQ6XG4gICAgICAgICAgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJ0b3BMZWZ0XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgbWVudUJ1dHRvbi54IDwgcG9wb3ZlcldpZHRoICYmXG4gICAgICAgICAgbWVudUJ1dHRvbi55ID4gcG9wb3ZlckhlaWdodCAmJlxuICAgICAgICAgIG1lbnVCdXR0b24ucmlnaHQgPiBwb3BvdmVyV2lkdGggJiZcbiAgICAgICAgICBtZW51QnV0dG9uLmJvdHRvbSA8IHBvcG92ZXJIZWlnaHQ6XG4gICAgICAgICAgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJ0b3BSaWdodFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIG1lbnVCdXR0b24ucmlnaHQgPCBwb3BvdmVyV2lkdGggJiYgbWVudUJ1dHRvbi54ID4gcG9wb3ZlcldpZHRoOlxuICAgICAgICAgIHBvcHZlclBvc2l0aW9uQXV0byA9IFwiYm90dG9tTGVmdFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHBvcHZlclBvc2l0aW9uQXV0byA9IFwiYm90dG9tUmlnaHRcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhcmlhbnRzID09IFwiZGlhbG9nXCIpIHtcbiAgICAgIHN3aXRjaCAocG9wdmVyUG9zaXRpb24gPT0gXCJhdXRvXCIpIHtcbiAgICAgICAgY2FzZSBtZW51QnV0dG9uLnggPiBwb3BvdmVyV2lkdGggJiYgbWVudUJ1dHRvbi5yaWdodCA8IHBvcG92ZXJXaWR0aDpcbiAgICAgICAgICBwb3B2ZXJQb3NpdGlvbkF1dG8gPSBcImNlbnRlckxlZnRcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBtZW51QnV0dG9uLnggPCBwb3BvdmVyV2lkdGggJiYgbWVudUJ1dHRvbi5yaWdodCA+IHBvcG92ZXJXaWR0aDpcbiAgICAgICAgICBwb3B2ZXJQb3NpdGlvbkF1dG8gPSBcImNlbnRlclJpZ2h0XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgbWVudUJ1dHRvbi54ID4gcG9wb3ZlcldpZHRoICYmXG4gICAgICAgICAgbWVudUJ1dHRvbi55ID4gcG9wb3ZlckhlaWdodCAmJlxuICAgICAgICAgIG1lbnVCdXR0b24ucmlnaHQgPiBwb3BvdmVyV2lkdGggJiZcbiAgICAgICAgICBtZW51QnV0dG9uLmJvdHRvbSA8IHBvcG92ZXJIZWlnaHQ6XG4gICAgICAgICAgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJjZW50ZXJUb3BcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwb3B2ZXJQb3NpdGlvbkF1dG8gPSBcImNlbnRlckJvdHRvbVwiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuPC9zY3JpcHQ+XG5cbjxzdHlsZSBnbG9iYWw+XG4gIC5ydWJ1cy1Qb3BvdmVyLXJlZ2lzdGVyaW5nIHtcbiAgICBoZWlnaHQ6IHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSk7XG4gIH1cbiAgLnNwZWN0cnVtLVBvcG92ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYmFja2dyb3VuZC1jb2xvciwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWNvbG9yLWdyYXktNTApKTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYm9yZGVyLWNvbG9yLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItY29sb3ItZGFyaykpO1xuICAgIGJveC1zaGFkb3c6IDAgMXB4IDRweCB2YXIoLS1zcGVjdHJ1bS1wb3BvdmVyLXNoYWRvdy1jb2xvciwgdmFyKC0tc3BlY3RydW0tYWxpYXMtZHJvcHNoYWRvdy1jb2xvcikpO1xuICB9XG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIHtcbiAgICB6LWluZGV4OiAxMDA7XG4gIH1cbiAgLnNwZWN0cnVtLVBvcG92ZXIge1xuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcblxuICAgIG9wYWNpdHk6IDA7XG5cbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWFuaW1hdGlvbi1kdXJhdGlvbi0xMDAsIDEzMG1zKSBlYXNlLWluLW91dCxcbiAgICAgIG9wYWNpdHkgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWFuaW1hdGlvbi1kdXJhdGlvbi0xMDAsIDEzMG1zKSBlYXNlLWluLW91dCxcbiAgICAgIHZpc2liaWxpdHkgMG1zIGxpbmVhciB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtYW5pbWF0aW9uLWR1cmF0aW9uLTEwMCwgMTMwbXMpO1xuXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIH1cblxuICAuc3BlY3RydW0tUG9wb3Zlci5pcy1vcGVuIHtcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xuXG4gICAgb3BhY2l0eTogMTtcblxuICAgIHRyYW5zaXRpb24tZGVsYXk6IDBtcztcblxuICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICB9XG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIHtcbiAgICBkaXNwbGF5OiAtbXMtaW5saW5lLWZsZXhib3g7XG4gICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgLW1zLWZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuXG4gICAgbWluLXdpZHRoOiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNDAwKTtcbiAgICBtaW4taGVpZ2h0OiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNDAwKTtcblxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcblxuICAgIGJvcmRlci1zdHlsZTogc29saWQ7XG4gICAgYm9yZGVyLXdpZHRoOiB2YXIoLS1zcGVjdHJ1bS1wb3BvdmVyLWJvcmRlci1zaXplLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItc2l6ZS10aGluKSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1ib3JkZXItcmFkaXVzLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItcmFkaXVzLXJlZ3VsYXIpKTtcblxuICAgIG91dGxpbmU6IG5vbmU7XG4gIH1cblxuICAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHdpZHRoOiBjYWxjKHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgKyAxcHgpO1xuICAgIGhlaWdodDogY2FsYyhcbiAgICAgIHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgLyAyICtcbiAgICAgICAgdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1ib3JkZXItc2l6ZSwgdmFyKC0tc3BlY3RydW0tYWxpYXMtYm9yZGVyLXNpemUtdGhpbikpXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHdpZHRoOiBjYWxjKHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgKyAxcHgpO1xuICAgIGhlaWdodDogY2FsYyhcbiAgICAgIHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgLyAyICtcbiAgICAgICAgdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1ib3JkZXItc2l6ZSwgdmFyKC0tc3BlY3RydW0tYWxpYXMtYm9yZGVyLXNpemUtdGhpbikpXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tUG9wb3Zlci10aXA6OmFmdGVyIHtcbiAgICBjb250ZW50OiBcIlwiO1xuICAgIHdpZHRoOiB2YXIoLS1zcGVjdHJ1bS1wb3BvdmVyLXRpcC13aWR0aCwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTI1MCkpO1xuICAgIGhlaWdodDogdmFyKC0tc3BlY3RydW0tcG9wb3Zlci10aXAtd2lkdGgsIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0yNTApKTtcbiAgICBib3JkZXItd2lkdGg6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYm9yZGVyLXNpemUsIHZhcigtLXNwZWN0cnVtLWFsaWFzLWJvcmRlci1zaXplLXRoaW4pKTtcbiAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg0NWRlZyk7XG4gICAgdG9wOiAtMThweDtcbiAgfVxuXG4gIC5zcGVjdHJ1bS1Qb3BvdmVyLS1kaWFsb2cge1xuICAgIG1pbi13aWR0aDogMjcwcHg7XG4gICAgcGFkZGluZzogMzBweCAyOXB4O1xuICB9XG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIC5zcGVjdHJ1bS1EaWFsb2ctaGVhZGVyLFxuICAuc3BlY3RydW0tUG9wb3ZlciAuc3BlY3RydW0tRGlhbG9nLWZvb3RlcixcbiAgLnNwZWN0cnVtLVBvcG92ZXIgLnNwZWN0cnVtLURpYWxvZy13cmFwcGVyIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgfVxuXG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcDo6YWZ0ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYmFja2dyb3VuZC1jb2xvciwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWNvbG9yLWdyYXktNTApKTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYm9yZGVyLWNvbG9yLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItY29sb3ItZGFyaykpO1xuICAgIGJveC1zaGFkb3c6IC0xcHggLTFweCA0cHggdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1zaGFkb3ctY29sb3IsIHZhcigtLXNwZWN0cnVtLWFsaWFzLWRyb3BzaGFkb3ctY29sb3IpKTtcbiAgfVxuXG4gIC5ydWJ1cy1Qb3BvdmVyLS1ib3R0b21SaWdodCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgY2FsYygtMC44ICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkpKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tYm90dG9tUmlnaHQge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpKSxcbiAgICAgIGNhbGMoLTAuOCAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWJvdHRvbVJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1ib3R0b21SaWdodC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC0xICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSkpLCAwKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tYm90dG9tTGVmdCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpKSxcbiAgICAgIGNhbGMoLTAuOCAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWJvdHRvbUxlZnQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSksIDApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1ib3R0b21MZWZ0IHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSlcbiAgICAgICksXG4gICAgICBjYWxjKC0wLjggKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSlcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1ib3R0b21MZWZ0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTI1KVxuICAgICAgKSxcbiAgICAgIDBcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItLXRvcExlZnQge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMC44ICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tc3BlY3RydW0tZHJvcGRvd24tZmx5b3V0LW1lbnUtb2Zmc2V0LXksIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLXRvcExlZnQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAqIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tdG9wTGVmdCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpXG4gICAgICApLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXNwZWN0cnVtLWRyb3Bkb3duLWZseW91dC1tZW51LW9mZnNldC15LCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLXRvcExlZnQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpXG4gICAgICApLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgK1xuICAgICAgICAgICAgICB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMilcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS10b3BSaWdodCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICAwLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXNwZWN0cnVtLWRyb3Bkb3duLWZseW91dC1tZW51LW9mZnNldC15LCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItLXRvcFJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgMCxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAqIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tdG9wUmlnaHQge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0wLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgK1xuICAgICAgICAgICAgICB2YXIoLS1zcGVjdHJ1bS1kcm9wZG93bi1mbHlvdXQtbWVudS1vZmZzZXQteSwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tdG9wUmlnaHQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSkpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgK1xuICAgICAgICAgICAgICB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMilcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1sZWZ0VG9wIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLWxlZnRUb3Age1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMC44ICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTUwKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWxlZnRUb3AuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpLFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tbGVmdFRvcC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNTApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tcmlnaHRUb3Age1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygwLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLXJpZ2h0VG9wLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygxICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSlcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1yaWdodFRvcCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKDAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTUwKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLXJpZ2h0VG9wLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygxICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNTApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tcmlnaHRCb3R0b20ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygwLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tcmlnaHRCb3R0b20uaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKDEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tcmlnaHRCb3R0b20ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygwLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTUwKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLXJpZ2h0Qm90dG9tLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygxICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS01MClcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1sZWZ0Qm90dG9tIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tbGVmdEJvdHRvbSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0wLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS01MClcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1sZWZ0Qm90dG9tLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tbGVmdEJvdHRvbS5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS01MClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItLWNlbnRlckJvdHRvbSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgLyAyICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSAvIDIpLFxuICAgICAgY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tY2VudGVyQm90dG9tLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpIC8gMiArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgLyAyKSxcbiAgICAgIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSlcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlckJvdHRvbS5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSAvIDIgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpIC8gMiksXG4gICAgICB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTI1KVxuICAgICk7XG4gIH1cbiAgLnNwZWN0cnVtLS1tZWRpdW0gLnJ1YnVzLVBvcG92ZXItLWNlbnRlckJvdHRvbSAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIHRvcDogY2FsYygtMC45NjEgKiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTMwKSk7XG4gIH1cbiAgLnNwZWN0cnVtLS1sYXJnZSAucnVidXMtUG9wb3Zlci0tY2VudGVyQm90dG9tIC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcCB7XG4gICAgdG9wOiBjYWxjKC0xICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSkpO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJCb3R0b20gLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICBsZWZ0OiBjYWxjKCh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLXdpZHRoKSkgLyAyKTtcblxuICAgIHRyYW5zZm9ybTogcm90YXRlKDE4MGRlZyk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclRvcCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgLyAyICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSAvIDIpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkgKyAodmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLW1lZGl1bSAucnVidXMtUG9wb3Zlci0tY2VudGVyVG9wLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpIC8gMiArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgLyAyKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci10aXAtaGVpZ2h0KSArICh2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSlcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclRvcC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSAvIDIgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpIC8gMiksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTc1KSlcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbWVkaXVtIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJUb3AgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICBib3R0b206IGNhbGMoLTAuOTYxICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEzMCkpO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclRvcCAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIGJvdHRvbTogY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tY2VudGVyVG9wIC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcCB7XG4gICAgbGVmdDogY2FsYygodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgLSB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC13aWR0aCkpIC8gMik7XG5cbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tY2VudGVyTGVmdCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0wLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMikpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAoKFxuICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodClcbiAgICAgICAgICAgICAgKSAvIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLW1lZGl1bSAucnVidXMtUG9wb3Zlci0tY2VudGVyTGVmdC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMikpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAoKFxuICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodClcbiAgICAgICAgICAgICAgKSAvIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLWxhcmdlIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJMZWZ0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMTUpICogMikpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAoKFxuICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodClcbiAgICAgICAgICAgICAgKSAvIDEuOSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnNwZWN0cnVtLS1tZWRpdW0gLnJ1YnVzLVBvcG92ZXItLWNlbnRlckxlZnQgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICB0b3A6IGNhbGMoKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkpIC8gMik7XG4gICAgcmlnaHQ6IGNhbGMoLTAuOTkgKiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjAwKSk7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoLTkwZGVnKTtcbiAgfVxuICAuc3BlY3RydW0tLWxhcmdlIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJMZWZ0IC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcCB7XG4gICAgdG9wOiBjYWxjKCh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC1oZWlnaHQpKSAvIDIpO1xuICAgIHJpZ2h0OiBjYWxjKC0wLjk3MiAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0yMDApKTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgtOTBkZWcpO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJSaWdodCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKFxuICAgICAgICAwLjggKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSArXG4gICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci10aXAtd2lkdGgpIC8gM1xuICAgICAgKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKChcbiAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC1oZWlnaHQpXG4gICAgICAgICAgICAgICkgLyAyKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnNwZWN0cnVtLS1tZWRpdW0gLnJ1YnVzLVBvcG92ZXItLWNlbnRlclJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYyhcbiAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkgK1xuICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLXdpZHRoKSAvIDNcbiAgICAgICksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqICgoXG4gICAgICAgICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgK1xuICAgICAgICAgICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci10aXAtaGVpZ2h0KVxuICAgICAgICAgICAgICApIC8gMilcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYyh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTExNSkgKiAyKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKChcbiAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC1oZWlnaHQpXG4gICAgICAgICAgICAgICkgLyAxLjkpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLW1lZGl1bSAucnVidXMtUG9wb3Zlci0tY2VudGVyUmlnaHQgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICB0b3A6IGNhbGMoKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkpIC8gMik7XG4gICAgbGVmdDogY2FsYygtMC45OSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0yMDApKTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg5MGRlZyk7XG4gIH1cbiAgLnNwZWN0cnVtLS1sYXJnZSAucnVidXMtUG9wb3Zlci0tY2VudGVyUmlnaHQgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICB0b3A6IGNhbGMoKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkpIC8gMik7XG4gICAgbGVmdDogY2FsYygtMC45NzIgKiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjAwKSk7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoOTBkZWcpO1xuICB9XG48L3N0eWxlPlxuXG48ZGl2IGNsYXNzPVwicnVidXMtUG9wb3Zlci1yZWdpc3RlcmluZ1wiIC8+XG5cbjxkaXZcbiAgY2xhc3M9XCJzcGVjdHJ1bS1Qb3BvdmVyIHJ1YnVzLVBvcG92ZXItLXtwb3B2ZXJQb3NpdGlvbiA9PSAnYXV0bycgPyBwb3B2ZXJQb3NpdGlvbkF1dG8gOiBwb3B2ZXJQb3NpdGlvbn1cbiAgICB7aXNRdWlldCAmJiB2YXJpYW50cyA9PT0gJ21lbnUnID8gYHJ1YnVzLVBvcG92ZXItcXVpZXQtLSR7cG9wdmVyUG9zaXRpb24gPT0gJ2F1dG8nID8gcG9wdmVyUG9zaXRpb25BdXRvIDogcG9wdmVyUG9zaXRpb259YCA6IGBgfVxuICAgIHskJHJlc3RQcm9wcy5jbGFzc31cIlxuICBjbGFzczppcy1vcGVuPXtpc09wZW59XG4gIGNsYXNzOnNwZWN0cnVtLVBvcG92ZXItLWRpYWxvZz17dmFyaWFudHMgPT09ICdkaWFsb2cnfVxuICBiaW5kOnRoaXM9e3BvcG92ZXJ9PlxuICB7I2lmIHZhcmlhbnRzID09PSAnbWVudSd9XG4gICAgPHNsb3QgLz5cbiAgezplbHNlIGlmIHZhcmlhbnRzID09PSAnZGlhbG9nJ31cbiAgICA8ZGl2IGNsYXNzPVwic3BlY3RydW0tRGlhbG9nLWhlYWRlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNwZWN0cnVtLURpYWxvZy10aXRsZVwiPnt0aXRsZX08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic3BlY3RydW0tRGlhbG9nLWNvbnRlbnRcIj5cbiAgICAgIDxzbG90IC8+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNwZWN0cnVtLVBvcG92ZXItdGlwXCIgYmluZDp0aGlzPXtwb3BvdmVyVGlwfSAvPlxuICB7L2lmfVxuPC9kaXY+XG4iLCIvL1NhZmFyaSBEYXRlIGZ1bmN0aW9uIHBvbHlmaWxsXG4hKGZ1bmN0aW9uIChfRGF0ZSkge1xuICBmdW5jdGlvbiBzdGFuZGFyZGl6ZUFyZ3MoYXJncykge1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXJnc1swXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihfRGF0ZS5wYXJzZShhcmdzWzBdKSkpIHtcbiAgICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLy0vZywgXCIvXCIpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiAkRGF0ZSgpIHtcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mICREYXRlKSB7XG4gICAgICByZXR1cm4gbmV3IChGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5hcHBseShfRGF0ZSwgW251bGxdLmNvbmNhdChzdGFuZGFyZGl6ZUFyZ3MoYXJndW1lbnRzKSkpKSgpO1xuICAgIH1cbiAgICByZXR1cm4gX0RhdGUoKTtcbiAgfVxuICAkRGF0ZS5wcm90b3R5cGUgPSBfRGF0ZS5wcm90b3R5cGU7XG5cbiAgJERhdGUubm93ID0gX0RhdGUubm93O1xuICAkRGF0ZS5VVEMgPSBfRGF0ZS5VVEM7XG4gICREYXRlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfRGF0ZS5wYXJzZS5hcHBseShfRGF0ZSwgc3RhbmRhcmRpemVBcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIERhdGUgPSAkRGF0ZTtcbn0pKERhdGUpO1xuIiwiJ3VzZSBzdHJpY3QnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRcImFsaWNlYmx1ZVwiOiBbMjQwLCAyNDgsIDI1NV0sXHJcblx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwgMjM1LCAyMTVdLFxyXG5cdFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiYXF1YW1hcmluZVwiOiBbMTI3LCAyNTUsIDIxMl0sXHJcblx0XCJhenVyZVwiOiBbMjQwLCAyNTUsIDI1NV0sXHJcblx0XCJiZWlnZVwiOiBbMjQ1LCAyNDUsIDIyMF0sXHJcblx0XCJiaXNxdWVcIjogWzI1NSwgMjI4LCAxOTZdLFxyXG5cdFwiYmxhY2tcIjogWzAsIDAsIDBdLFxyXG5cdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwgMjM1LCAyMDVdLFxyXG5cdFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcclxuXHRcImJsdWV2aW9sZXRcIjogWzEzOCwgNDMsIDIyNl0sXHJcblx0XCJicm93blwiOiBbMTY1LCA0MiwgNDJdLFxyXG5cdFwiYnVybHl3b29kXCI6IFsyMjIsIDE4NCwgMTM1XSxcclxuXHRcImNhZGV0Ymx1ZVwiOiBbOTUsIDE1OCwgMTYwXSxcclxuXHRcImNoYXJ0cmV1c2VcIjogWzEyNywgMjU1LCAwXSxcclxuXHRcImNob2NvbGF0ZVwiOiBbMjEwLCAxMDUsIDMwXSxcclxuXHRcImNvcmFsXCI6IFsyNTUsIDEyNywgODBdLFxyXG5cdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwgMTQ5LCAyMzddLFxyXG5cdFwiY29ybnNpbGtcIjogWzI1NSwgMjQ4LCAyMjBdLFxyXG5cdFwiY3JpbXNvblwiOiBbMjIwLCAyMCwgNjBdLFxyXG5cdFwiY3lhblwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiZGFya2JsdWVcIjogWzAsIDAsIDEzOV0sXHJcblx0XCJkYXJrY3lhblwiOiBbMCwgMTM5LCAxMzldLFxyXG5cdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LCAxMzQsIDExXSxcclxuXHRcImRhcmtncmF5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtncmVlblwiOiBbMCwgMTAwLCAwXSxcclxuXHRcImRhcmtncmV5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtraGFraVwiOiBbMTg5LCAxODMsIDEwN10sXHJcblx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LCAwLCAxMzldLFxyXG5cdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LCAxMDcsIDQ3XSxcclxuXHRcImRhcmtvcmFuZ2VcIjogWzI1NSwgMTQwLCAwXSxcclxuXHRcImRhcmtvcmNoaWRcIjogWzE1MywgNTAsIDIwNF0sXHJcblx0XCJkYXJrcmVkXCI6IFsxMzksIDAsIDBdLFxyXG5cdFwiZGFya3NhbG1vblwiOiBbMjMzLCAxNTAsIDEyMl0sXHJcblx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywgMTg4LCAxNDNdLFxyXG5cdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsIDYxLCAxMzldLFxyXG5cdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrc2xhdGVncmV5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmt0dXJxdW9pc2VcIjogWzAsIDIwNiwgMjA5XSxcclxuXHRcImRhcmt2aW9sZXRcIjogWzE0OCwgMCwgMjExXSxcclxuXHRcImRlZXBwaW5rXCI6IFsyNTUsIDIwLCAxNDddLFxyXG5cdFwiZGVlcHNreWJsdWVcIjogWzAsIDE5MSwgMjU1XSxcclxuXHRcImRpbWdyYXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZGltZ3JleVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkb2RnZXJibHVlXCI6IFszMCwgMTQ0LCAyNTVdLFxyXG5cdFwiZmlyZWJyaWNrXCI6IFsxNzgsIDM0LCAzNF0sXHJcblx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LCAyNTAsIDI0MF0sXHJcblx0XCJmb3Jlc3RncmVlblwiOiBbMzQsIDEzOSwgMzRdLFxyXG5cdFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwiZ2FpbnNib3JvXCI6IFsyMjAsIDIyMCwgMjIwXSxcclxuXHRcImdob3N0d2hpdGVcIjogWzI0OCwgMjQ4LCAyNTVdLFxyXG5cdFwiZ29sZFwiOiBbMjU1LCAyMTUsIDBdLFxyXG5cdFwiZ29sZGVucm9kXCI6IFsyMTgsIDE2NSwgMzJdLFxyXG5cdFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJncmVlblwiOiBbMCwgMTI4LCAwXSxcclxuXHRcImdyZWVueWVsbG93XCI6IFsxNzMsIDI1NSwgNDddLFxyXG5cdFwiZ3JleVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJob25leWRld1wiOiBbMjQwLCAyNTUsIDI0MF0sXHJcblx0XCJob3RwaW5rXCI6IFsyNTUsIDEwNSwgMTgwXSxcclxuXHRcImluZGlhbnJlZFwiOiBbMjA1LCA5MiwgOTJdLFxyXG5cdFwiaW5kaWdvXCI6IFs3NSwgMCwgMTMwXSxcclxuXHRcIml2b3J5XCI6IFsyNTUsIDI1NSwgMjQwXSxcclxuXHRcImtoYWtpXCI6IFsyNDAsIDIzMCwgMTQwXSxcclxuXHRcImxhdmVuZGVyXCI6IFsyMzAsIDIzMCwgMjUwXSxcclxuXHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwgMjQwLCAyNDVdLFxyXG5cdFwibGF3bmdyZWVuXCI6IFsxMjQsIDI1MiwgMF0sXHJcblx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwgMjUwLCAyMDVdLFxyXG5cdFwibGlnaHRibHVlXCI6IFsxNzMsIDIxNiwgMjMwXSxcclxuXHRcImxpZ2h0Y29yYWxcIjogWzI0MCwgMTI4LCAxMjhdLFxyXG5cdFwibGlnaHRjeWFuXCI6IFsyMjQsIDI1NSwgMjU1XSxcclxuXHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsIDI1MCwgMjEwXSxcclxuXHRcImxpZ2h0Z3JheVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodGdyZWVuXCI6IFsxNDQsIDIzOCwgMTQ0XSxcclxuXHRcImxpZ2h0Z3JleVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodHBpbmtcIjogWzI1NSwgMTgyLCAxOTNdLFxyXG5cdFwibGlnaHRzYWxtb25cIjogWzI1NSwgMTYwLCAxMjJdLFxyXG5cdFwibGlnaHRzZWFncmVlblwiOiBbMzIsIDE3OCwgMTcwXSxcclxuXHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDI1MF0sXHJcblx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LCAxOTYsIDIyMl0sXHJcblx0XCJsaWdodHllbGxvd1wiOiBbMjU1LCAyNTUsIDIyNF0sXHJcblx0XCJsaW1lXCI6IFswLCAyNTUsIDBdLFxyXG5cdFwibGltZWdyZWVuXCI6IFs1MCwgMjA1LCA1MF0sXHJcblx0XCJsaW5lblwiOiBbMjUwLCAyNDAsIDIzMF0sXHJcblx0XCJtYWdlbnRhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXHJcblx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsIDIwNSwgMTcwXSxcclxuXHRcIm1lZGl1bWJsdWVcIjogWzAsIDAsIDIwNV0sXHJcblx0XCJtZWRpdW1vcmNoaWRcIjogWzE4NiwgODUsIDIxMV0sXHJcblx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywgMTEyLCAyMTldLFxyXG5cdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLCAxNzksIDExM10sXHJcblx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywgMTA0LCAyMzhdLFxyXG5cdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsIDI1MCwgMTU0XSxcclxuXHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsIDIwOSwgMjA0XSxcclxuXHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LCAyMSwgMTMzXSxcclxuXHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsIDI1LCAxMTJdLFxyXG5cdFwibWludGNyZWFtXCI6IFsyNDUsIDI1NSwgMjUwXSxcclxuXHRcIm1pc3R5cm9zZVwiOiBbMjU1LCAyMjgsIDIyNV0sXHJcblx0XCJtb2NjYXNpblwiOiBbMjU1LCAyMjgsIDE4MV0sXHJcblx0XCJuYXZham93aGl0ZVwiOiBbMjU1LCAyMjIsIDE3M10sXHJcblx0XCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxyXG5cdFwib2xkbGFjZVwiOiBbMjUzLCAyNDUsIDIzMF0sXHJcblx0XCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxyXG5cdFwib2xpdmVkcmFiXCI6IFsxMDcsIDE0MiwgMzVdLFxyXG5cdFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXHJcblx0XCJvcmFuZ2VyZWRcIjogWzI1NSwgNjksIDBdLFxyXG5cdFwib3JjaGlkXCI6IFsyMTgsIDExMiwgMjE0XSxcclxuXHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwgMjMyLCAxNzBdLFxyXG5cdFwicGFsZWdyZWVuXCI6IFsxNTIsIDI1MSwgMTUyXSxcclxuXHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwgMjM4LCAyMzhdLFxyXG5cdFwicGFsZXZpb2xldHJlZFwiOiBbMjE5LCAxMTIsIDE0N10sXHJcblx0XCJwYXBheWF3aGlwXCI6IFsyNTUsIDIzOSwgMjEzXSxcclxuXHRcInBlYWNocHVmZlwiOiBbMjU1LCAyMTgsIDE4NV0sXHJcblx0XCJwZXJ1XCI6IFsyMDUsIDEzMywgNjNdLFxyXG5cdFwicGlua1wiOiBbMjU1LCAxOTIsIDIwM10sXHJcblx0XCJwbHVtXCI6IFsyMjEsIDE2MCwgMjIxXSxcclxuXHRcInBvd2RlcmJsdWVcIjogWzE3NiwgMjI0LCAyMzBdLFxyXG5cdFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXHJcblx0XCJyZWJlY2NhcHVycGxlXCI6IFsxMDIsIDUxLCAxNTNdLFxyXG5cdFwicmVkXCI6IFsyNTUsIDAsIDBdLFxyXG5cdFwicm9zeWJyb3duXCI6IFsxODgsIDE0MywgMTQzXSxcclxuXHRcInJveWFsYmx1ZVwiOiBbNjUsIDEwNSwgMjI1XSxcclxuXHRcInNhZGRsZWJyb3duXCI6IFsxMzksIDY5LCAxOV0sXHJcblx0XCJzYWxtb25cIjogWzI1MCwgMTI4LCAxMTRdLFxyXG5cdFwic2FuZHlicm93blwiOiBbMjQ0LCAxNjQsIDk2XSxcclxuXHRcInNlYWdyZWVuXCI6IFs0NiwgMTM5LCA4N10sXHJcblx0XCJzZWFzaGVsbFwiOiBbMjU1LCAyNDUsIDIzOF0sXHJcblx0XCJzaWVubmFcIjogWzE2MCwgODIsIDQ1XSxcclxuXHRcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXHJcblx0XCJza3libHVlXCI6IFsxMzUsIDIwNiwgMjM1XSxcclxuXHRcInNsYXRlYmx1ZVwiOiBbMTA2LCA5MCwgMjA1XSxcclxuXHRcInNsYXRlZ3JheVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbGF0ZWdyZXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic25vd1wiOiBbMjU1LCAyNTAsIDI1MF0sXHJcblx0XCJzcHJpbmdncmVlblwiOiBbMCwgMjU1LCAxMjddLFxyXG5cdFwic3RlZWxibHVlXCI6IFs3MCwgMTMwLCAxODBdLFxyXG5cdFwidGFuXCI6IFsyMTAsIDE4MCwgMTQwXSxcclxuXHRcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcclxuXHRcInRoaXN0bGVcIjogWzIxNiwgMTkxLCAyMTZdLFxyXG5cdFwidG9tYXRvXCI6IFsyNTUsIDk5LCA3MV0sXHJcblx0XCJ0dXJxdW9pc2VcIjogWzY0LCAyMjQsIDIwOF0sXHJcblx0XCJ2aW9sZXRcIjogWzIzOCwgMTMwLCAyMzhdLFxyXG5cdFwid2hlYXRcIjogWzI0NSwgMjIyLCAxNzldLFxyXG5cdFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxyXG5cdFwid2hpdGVzbW9rZVwiOiBbMjQ1LCAyNDUsIDI0NV0sXHJcblx0XCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXSxcclxuXHRcInllbGxvd2dyZWVuXCI6IFsxNTQsIDIwNSwgNTBdXHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBcnJheWlzaChvYmopIHtcblx0aWYgKCFvYmogfHwgdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gb2JqIGluc3RhbmNlb2YgQXJyYXkgfHwgQXJyYXkuaXNBcnJheShvYmopIHx8XG5cdFx0KG9iai5sZW5ndGggPj0gMCAmJiAob2JqLnNwbGljZSBpbnN0YW5jZW9mIEZ1bmN0aW9uIHx8XG5cdFx0XHQoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIChvYmoubGVuZ3RoIC0gMSkpICYmIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9PSAnU3RyaW5nJykpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0FycmF5aXNoID0gcmVxdWlyZSgnaXMtYXJyYXlpc2gnKTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbnZhciBzd2l6emxlID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzd2l6emxlKGFyZ3MpIHtcblx0dmFyIHJlc3VsdHMgPSBbXTtcblxuXHRmb3IgKHZhciBpID0gMCwgbGVuID0gYXJncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdHZhciBhcmcgPSBhcmdzW2ldO1xuXG5cdFx0aWYgKGlzQXJyYXlpc2goYXJnKSkge1xuXHRcdFx0Ly8gaHR0cDovL2pzcGVyZi5jb20vamF2YXNjcmlwdC1hcnJheS1jb25jYXQtdnMtcHVzaC85OFxuXHRcdFx0cmVzdWx0cyA9IGNvbmNhdC5jYWxsKHJlc3VsdHMsIHNsaWNlLmNhbGwoYXJnKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMucHVzaChhcmcpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRzO1xufTtcblxuc3dpenpsZS53cmFwID0gZnVuY3Rpb24gKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGZuKHN3aXp6bGUoYXJndW1lbnRzKSk7XG5cdH07XG59O1xuIiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjb2xvck5hbWVzID0gcmVxdWlyZSgnY29sb3ItbmFtZScpO1xudmFyIHN3aXp6bGUgPSByZXF1aXJlKCdzaW1wbGUtc3dpenpsZScpO1xuXG52YXIgcmV2ZXJzZU5hbWVzID0ge307XG5cbi8vIGNyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xuZm9yICh2YXIgbmFtZSBpbiBjb2xvck5hbWVzKSB7XG5cdGlmIChjb2xvck5hbWVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG5cdFx0cmV2ZXJzZU5hbWVzW2NvbG9yTmFtZXNbbmFtZV1dID0gbmFtZTtcblx0fVxufVxuXG52YXIgY3MgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblx0dG86IHt9LFxuXHRnZXQ6IHt9XG59O1xuXG5jcy5nZXQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdHZhciBwcmVmaXggPSBzdHJpbmcuc3Vic3RyaW5nKDAsIDMpLnRvTG93ZXJDYXNlKCk7XG5cdHZhciB2YWw7XG5cdHZhciBtb2RlbDtcblx0c3dpdGNoIChwcmVmaXgpIHtcblx0XHRjYXNlICdoc2wnOlxuXHRcdFx0dmFsID0gY3MuZ2V0LmhzbChzdHJpbmcpO1xuXHRcdFx0bW9kZWwgPSAnaHNsJztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2h3Yic6XG5cdFx0XHR2YWwgPSBjcy5nZXQuaHdiKHN0cmluZyk7XG5cdFx0XHRtb2RlbCA9ICdod2InO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHZhbCA9IGNzLmdldC5yZ2Ioc3RyaW5nKTtcblx0XHRcdG1vZGVsID0gJ3JnYic7XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdGlmICghdmFsKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge21vZGVsOiBtb2RlbCwgdmFsdWU6IHZhbH07XG59O1xuXG5jcy5nZXQucmdiID0gZnVuY3Rpb24gKHN0cmluZykge1xuXHRpZiAoIXN0cmluZykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0dmFyIGFiYnIgPSAvXiMoW2EtZjAtOV17Myw0fSkkL2k7XG5cdHZhciBoZXggPSAvXiMoW2EtZjAtOV17Nn0pKFthLWYwLTldezJ9KT8kL2k7XG5cdHZhciByZ2JhID0gL15yZ2JhP1xcKFxccyooWystXT9cXGQrKVxccyosXFxzKihbKy1dP1xcZCspXFxzKixcXHMqKFsrLV0/XFxkKylcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBwZXIgPSAvXnJnYmE/XFwoXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkkLztcblx0dmFyIGtleXdvcmQgPSAvKFxcRCspLztcblxuXHR2YXIgcmdiID0gWzAsIDAsIDAsIDFdO1xuXHR2YXIgbWF0Y2g7XG5cdHZhciBpO1xuXHR2YXIgaGV4QWxwaGE7XG5cblx0aWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGhleCkpIHtcblx0XHRoZXhBbHBoYSA9IG1hdGNoWzJdO1xuXHRcdG1hdGNoID0gbWF0Y2hbMV07XG5cblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHQvLyBodHRwczovL2pzcGVyZi5jb20vc2xpY2UtdnMtc3Vic3RyLXZzLXN1YnN0cmluZy1tZXRob2RzLWxvbmctc3RyaW5nLzE5XG5cdFx0XHR2YXIgaTIgPSBpICogMjtcblx0XHRcdHJnYltpXSA9IHBhcnNlSW50KG1hdGNoLnNsaWNlKGkyLCBpMiArIDIpLCAxNik7XG5cdFx0fVxuXG5cdFx0aWYgKGhleEFscGhhKSB7XG5cdFx0XHRyZ2JbM10gPSBwYXJzZUludChoZXhBbHBoYSwgMTYpIC8gMjU1O1xuXHRcdH1cblx0fSBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChhYmJyKSkge1xuXHRcdG1hdGNoID0gbWF0Y2hbMV07XG5cdFx0aGV4QWxwaGEgPSBtYXRjaFszXTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHRcdHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2ldICsgbWF0Y2hbaV0sIDE2KTtcblx0XHR9XG5cblx0XHRpZiAoaGV4QWxwaGEpIHtcblx0XHRcdHJnYlszXSA9IHBhcnNlSW50KGhleEFscGhhICsgaGV4QWxwaGEsIDE2KSAvIDI1NTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocmdiYSkpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpICsgMV0sIDApO1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaFs0XSkge1xuXHRcdFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQobWF0Y2hbaSArIDFdKSAqIDIuNTUpO1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaFs0XSkge1xuXHRcdFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGtleXdvcmQpKSB7XG5cdFx0aWYgKG1hdGNoWzFdID09PSAndHJhbnNwYXJlbnQnKSB7XG5cdFx0XHRyZXR1cm4gWzAsIDAsIDAsIDBdO1xuXHRcdH1cblxuXHRcdHJnYiA9IGNvbG9yTmFtZXNbbWF0Y2hbMV1dO1xuXG5cdFx0aWYgKCFyZ2IpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJnYlszXSA9IDE7XG5cblx0XHRyZXR1cm4gcmdiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Zm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdHJnYltpXSA9IGNsYW1wKHJnYltpXSwgMCwgMjU1KTtcblx0fVxuXHRyZ2JbM10gPSBjbGFtcChyZ2JbM10sIDAsIDEpO1xuXG5cdHJldHVybiByZ2I7XG59O1xuXG5jcy5nZXQuaHNsID0gZnVuY3Rpb24gKHN0cmluZykge1xuXHRpZiAoIXN0cmluZykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0dmFyIGhzbCA9IC9eaHNsYT9cXChcXHMqKFsrLV0/KD86XFxkKlxcLik/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChoc2wpO1xuXG5cdGlmIChtYXRjaCkge1xuXHRcdHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuXHRcdHZhciBoID0gKHBhcnNlRmxvYXQobWF0Y2hbMV0pICsgMzYwKSAlIDM2MDtcblx0XHR2YXIgcyA9IGNsYW1wKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApO1xuXHRcdHZhciBsID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCk7XG5cdFx0dmFyIGEgPSBjbGFtcChpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuXG5cdFx0cmV0dXJuIFtoLCBzLCBsLCBhXTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuY3MuZ2V0Lmh3YiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcblx0aWYgKCFzdHJpbmcpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHZhciBod2IgPSAvXmh3YlxcKFxccyooWystXT9cXGQqW1xcLl0/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChod2IpO1xuXG5cdGlmIChtYXRjaCkge1xuXHRcdHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuXHRcdHZhciBoID0gKChwYXJzZUZsb2F0KG1hdGNoWzFdKSAlIDM2MCkgKyAzNjApICUgMzYwO1xuXHRcdHZhciB3ID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCk7XG5cdFx0dmFyIGIgPSBjbGFtcChwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKTtcblx0XHR2YXIgYSA9IGNsYW1wKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XG5cdFx0cmV0dXJuIFtoLCB3LCBiLCBhXTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuY3MudG8uaGV4ID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHRyZXR1cm4gKFxuXHRcdCcjJyArXG5cdFx0aGV4RG91YmxlKHJnYmFbMF0pICtcblx0XHRoZXhEb3VibGUocmdiYVsxXSkgK1xuXHRcdGhleERvdWJsZShyZ2JhWzJdKSArXG5cdFx0KHJnYmFbM10gPCAxXG5cdFx0XHQ/IChoZXhEb3VibGUoTWF0aC5yb3VuZChyZ2JhWzNdICogMjU1KSkpXG5cdFx0XHQ6ICcnKVxuXHQpO1xufTtcblxuY3MudG8ucmdiID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHRyZXR1cm4gcmdiYS5sZW5ndGggPCA0IHx8IHJnYmFbM10gPT09IDFcblx0XHQ/ICdyZ2IoJyArIE1hdGgucm91bmQocmdiYVswXSkgKyAnLCAnICsgTWF0aC5yb3VuZChyZ2JhWzFdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMl0pICsgJyknXG5cdFx0OiAncmdiYSgnICsgTWF0aC5yb3VuZChyZ2JhWzBdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMV0pICsgJywgJyArIE1hdGgucm91bmQocmdiYVsyXSkgKyAnLCAnICsgcmdiYVszXSArICcpJztcbn07XG5cbmNzLnRvLnJnYi5wZXJjZW50ID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHR2YXIgciA9IE1hdGgucm91bmQocmdiYVswXSAvIDI1NSAqIDEwMCk7XG5cdHZhciBnID0gTWF0aC5yb3VuZChyZ2JhWzFdIC8gMjU1ICogMTAwKTtcblx0dmFyIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0gLyAyNTUgKiAxMDApO1xuXG5cdHJldHVybiByZ2JhLmxlbmd0aCA8IDQgfHwgcmdiYVszXSA9PT0gMVxuXHRcdD8gJ3JnYignICsgciArICclLCAnICsgZyArICclLCAnICsgYiArICclKSdcblx0XHQ6ICdyZ2JhKCcgKyByICsgJyUsICcgKyBnICsgJyUsICcgKyBiICsgJyUsICcgKyByZ2JhWzNdICsgJyknO1xufTtcblxuY3MudG8uaHNsID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgaHNsYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblx0cmV0dXJuIGhzbGEubGVuZ3RoIDwgNCB8fCBoc2xhWzNdID09PSAxXG5cdFx0PyAnaHNsKCcgKyBoc2xhWzBdICsgJywgJyArIGhzbGFbMV0gKyAnJSwgJyArIGhzbGFbMl0gKyAnJSknXG5cdFx0OiAnaHNsYSgnICsgaHNsYVswXSArICcsICcgKyBoc2xhWzFdICsgJyUsICcgKyBoc2xhWzJdICsgJyUsICcgKyBoc2xhWzNdICsgJyknO1xufTtcblxuLy8gaHdiIGlzIGEgYml0IGRpZmZlcmVudCB0aGFuIHJnYihhKSAmIGhzbChhKSBzaW5jZSB0aGVyZSBpcyBubyBhbHBoYSBzcGVjaWZpYyBzeW50YXhcbi8vIChod2IgaGF2ZSBhbHBoYSBvcHRpb25hbCAmIDEgaXMgZGVmYXVsdCB2YWx1ZSlcbmNzLnRvLmh3YiA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGh3YmEgPSBzd2l6emxlKGFyZ3VtZW50cyk7XG5cblx0dmFyIGEgPSAnJztcblx0aWYgKGh3YmEubGVuZ3RoID49IDQgJiYgaHdiYVszXSAhPT0gMSkge1xuXHRcdGEgPSAnLCAnICsgaHdiYVszXTtcblx0fVxuXG5cdHJldHVybiAnaHdiKCcgKyBod2JhWzBdICsgJywgJyArIGh3YmFbMV0gKyAnJSwgJyArIGh3YmFbMl0gKyAnJScgKyBhICsgJyknO1xufTtcblxuY3MudG8ua2V5d29yZCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0cmV0dXJuIHJldmVyc2VOYW1lc1tyZ2Iuc2xpY2UoMCwgMyldO1xufTtcblxuLy8gaGVscGVyc1xuZnVuY3Rpb24gY2xhbXAobnVtLCBtaW4sIG1heCkge1xuXHRyZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCBudW0pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiBoZXhEb3VibGUobnVtKSB7XG5cdHZhciBzdHIgPSBudW0udG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdHJldHVybiAoc3RyLmxlbmd0aCA8IDIpID8gJzAnICsgc3RyIDogc3RyO1xufVxuIiwiJ3VzZSBzdHJpY3QnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRcImFsaWNlYmx1ZVwiOiBbMjQwLCAyNDgsIDI1NV0sXHJcblx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwgMjM1LCAyMTVdLFxyXG5cdFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiYXF1YW1hcmluZVwiOiBbMTI3LCAyNTUsIDIxMl0sXHJcblx0XCJhenVyZVwiOiBbMjQwLCAyNTUsIDI1NV0sXHJcblx0XCJiZWlnZVwiOiBbMjQ1LCAyNDUsIDIyMF0sXHJcblx0XCJiaXNxdWVcIjogWzI1NSwgMjI4LCAxOTZdLFxyXG5cdFwiYmxhY2tcIjogWzAsIDAsIDBdLFxyXG5cdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwgMjM1LCAyMDVdLFxyXG5cdFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcclxuXHRcImJsdWV2aW9sZXRcIjogWzEzOCwgNDMsIDIyNl0sXHJcblx0XCJicm93blwiOiBbMTY1LCA0MiwgNDJdLFxyXG5cdFwiYnVybHl3b29kXCI6IFsyMjIsIDE4NCwgMTM1XSxcclxuXHRcImNhZGV0Ymx1ZVwiOiBbOTUsIDE1OCwgMTYwXSxcclxuXHRcImNoYXJ0cmV1c2VcIjogWzEyNywgMjU1LCAwXSxcclxuXHRcImNob2NvbGF0ZVwiOiBbMjEwLCAxMDUsIDMwXSxcclxuXHRcImNvcmFsXCI6IFsyNTUsIDEyNywgODBdLFxyXG5cdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwgMTQ5LCAyMzddLFxyXG5cdFwiY29ybnNpbGtcIjogWzI1NSwgMjQ4LCAyMjBdLFxyXG5cdFwiY3JpbXNvblwiOiBbMjIwLCAyMCwgNjBdLFxyXG5cdFwiY3lhblwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiZGFya2JsdWVcIjogWzAsIDAsIDEzOV0sXHJcblx0XCJkYXJrY3lhblwiOiBbMCwgMTM5LCAxMzldLFxyXG5cdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LCAxMzQsIDExXSxcclxuXHRcImRhcmtncmF5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtncmVlblwiOiBbMCwgMTAwLCAwXSxcclxuXHRcImRhcmtncmV5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtraGFraVwiOiBbMTg5LCAxODMsIDEwN10sXHJcblx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LCAwLCAxMzldLFxyXG5cdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LCAxMDcsIDQ3XSxcclxuXHRcImRhcmtvcmFuZ2VcIjogWzI1NSwgMTQwLCAwXSxcclxuXHRcImRhcmtvcmNoaWRcIjogWzE1MywgNTAsIDIwNF0sXHJcblx0XCJkYXJrcmVkXCI6IFsxMzksIDAsIDBdLFxyXG5cdFwiZGFya3NhbG1vblwiOiBbMjMzLCAxNTAsIDEyMl0sXHJcblx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywgMTg4LCAxNDNdLFxyXG5cdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsIDYxLCAxMzldLFxyXG5cdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrc2xhdGVncmV5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmt0dXJxdW9pc2VcIjogWzAsIDIwNiwgMjA5XSxcclxuXHRcImRhcmt2aW9sZXRcIjogWzE0OCwgMCwgMjExXSxcclxuXHRcImRlZXBwaW5rXCI6IFsyNTUsIDIwLCAxNDddLFxyXG5cdFwiZGVlcHNreWJsdWVcIjogWzAsIDE5MSwgMjU1XSxcclxuXHRcImRpbWdyYXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZGltZ3JleVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkb2RnZXJibHVlXCI6IFszMCwgMTQ0LCAyNTVdLFxyXG5cdFwiZmlyZWJyaWNrXCI6IFsxNzgsIDM0LCAzNF0sXHJcblx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LCAyNTAsIDI0MF0sXHJcblx0XCJmb3Jlc3RncmVlblwiOiBbMzQsIDEzOSwgMzRdLFxyXG5cdFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwiZ2FpbnNib3JvXCI6IFsyMjAsIDIyMCwgMjIwXSxcclxuXHRcImdob3N0d2hpdGVcIjogWzI0OCwgMjQ4LCAyNTVdLFxyXG5cdFwiZ29sZFwiOiBbMjU1LCAyMTUsIDBdLFxyXG5cdFwiZ29sZGVucm9kXCI6IFsyMTgsIDE2NSwgMzJdLFxyXG5cdFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJncmVlblwiOiBbMCwgMTI4LCAwXSxcclxuXHRcImdyZWVueWVsbG93XCI6IFsxNzMsIDI1NSwgNDddLFxyXG5cdFwiZ3JleVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJob25leWRld1wiOiBbMjQwLCAyNTUsIDI0MF0sXHJcblx0XCJob3RwaW5rXCI6IFsyNTUsIDEwNSwgMTgwXSxcclxuXHRcImluZGlhbnJlZFwiOiBbMjA1LCA5MiwgOTJdLFxyXG5cdFwiaW5kaWdvXCI6IFs3NSwgMCwgMTMwXSxcclxuXHRcIml2b3J5XCI6IFsyNTUsIDI1NSwgMjQwXSxcclxuXHRcImtoYWtpXCI6IFsyNDAsIDIzMCwgMTQwXSxcclxuXHRcImxhdmVuZGVyXCI6IFsyMzAsIDIzMCwgMjUwXSxcclxuXHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwgMjQwLCAyNDVdLFxyXG5cdFwibGF3bmdyZWVuXCI6IFsxMjQsIDI1MiwgMF0sXHJcblx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwgMjUwLCAyMDVdLFxyXG5cdFwibGlnaHRibHVlXCI6IFsxNzMsIDIxNiwgMjMwXSxcclxuXHRcImxpZ2h0Y29yYWxcIjogWzI0MCwgMTI4LCAxMjhdLFxyXG5cdFwibGlnaHRjeWFuXCI6IFsyMjQsIDI1NSwgMjU1XSxcclxuXHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsIDI1MCwgMjEwXSxcclxuXHRcImxpZ2h0Z3JheVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodGdyZWVuXCI6IFsxNDQsIDIzOCwgMTQ0XSxcclxuXHRcImxpZ2h0Z3JleVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodHBpbmtcIjogWzI1NSwgMTgyLCAxOTNdLFxyXG5cdFwibGlnaHRzYWxtb25cIjogWzI1NSwgMTYwLCAxMjJdLFxyXG5cdFwibGlnaHRzZWFncmVlblwiOiBbMzIsIDE3OCwgMTcwXSxcclxuXHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDI1MF0sXHJcblx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LCAxOTYsIDIyMl0sXHJcblx0XCJsaWdodHllbGxvd1wiOiBbMjU1LCAyNTUsIDIyNF0sXHJcblx0XCJsaW1lXCI6IFswLCAyNTUsIDBdLFxyXG5cdFwibGltZWdyZWVuXCI6IFs1MCwgMjA1LCA1MF0sXHJcblx0XCJsaW5lblwiOiBbMjUwLCAyNDAsIDIzMF0sXHJcblx0XCJtYWdlbnRhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXHJcblx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsIDIwNSwgMTcwXSxcclxuXHRcIm1lZGl1bWJsdWVcIjogWzAsIDAsIDIwNV0sXHJcblx0XCJtZWRpdW1vcmNoaWRcIjogWzE4NiwgODUsIDIxMV0sXHJcblx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywgMTEyLCAyMTldLFxyXG5cdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLCAxNzksIDExM10sXHJcblx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywgMTA0LCAyMzhdLFxyXG5cdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsIDI1MCwgMTU0XSxcclxuXHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsIDIwOSwgMjA0XSxcclxuXHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LCAyMSwgMTMzXSxcclxuXHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsIDI1LCAxMTJdLFxyXG5cdFwibWludGNyZWFtXCI6IFsyNDUsIDI1NSwgMjUwXSxcclxuXHRcIm1pc3R5cm9zZVwiOiBbMjU1LCAyMjgsIDIyNV0sXHJcblx0XCJtb2NjYXNpblwiOiBbMjU1LCAyMjgsIDE4MV0sXHJcblx0XCJuYXZham93aGl0ZVwiOiBbMjU1LCAyMjIsIDE3M10sXHJcblx0XCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxyXG5cdFwib2xkbGFjZVwiOiBbMjUzLCAyNDUsIDIzMF0sXHJcblx0XCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxyXG5cdFwib2xpdmVkcmFiXCI6IFsxMDcsIDE0MiwgMzVdLFxyXG5cdFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXHJcblx0XCJvcmFuZ2VyZWRcIjogWzI1NSwgNjksIDBdLFxyXG5cdFwib3JjaGlkXCI6IFsyMTgsIDExMiwgMjE0XSxcclxuXHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwgMjMyLCAxNzBdLFxyXG5cdFwicGFsZWdyZWVuXCI6IFsxNTIsIDI1MSwgMTUyXSxcclxuXHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwgMjM4LCAyMzhdLFxyXG5cdFwicGFsZXZpb2xldHJlZFwiOiBbMjE5LCAxMTIsIDE0N10sXHJcblx0XCJwYXBheWF3aGlwXCI6IFsyNTUsIDIzOSwgMjEzXSxcclxuXHRcInBlYWNocHVmZlwiOiBbMjU1LCAyMTgsIDE4NV0sXHJcblx0XCJwZXJ1XCI6IFsyMDUsIDEzMywgNjNdLFxyXG5cdFwicGlua1wiOiBbMjU1LCAxOTIsIDIwM10sXHJcblx0XCJwbHVtXCI6IFsyMjEsIDE2MCwgMjIxXSxcclxuXHRcInBvd2RlcmJsdWVcIjogWzE3NiwgMjI0LCAyMzBdLFxyXG5cdFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXHJcblx0XCJyZWJlY2NhcHVycGxlXCI6IFsxMDIsIDUxLCAxNTNdLFxyXG5cdFwicmVkXCI6IFsyNTUsIDAsIDBdLFxyXG5cdFwicm9zeWJyb3duXCI6IFsxODgsIDE0MywgMTQzXSxcclxuXHRcInJveWFsYmx1ZVwiOiBbNjUsIDEwNSwgMjI1XSxcclxuXHRcInNhZGRsZWJyb3duXCI6IFsxMzksIDY5LCAxOV0sXHJcblx0XCJzYWxtb25cIjogWzI1MCwgMTI4LCAxMTRdLFxyXG5cdFwic2FuZHlicm93blwiOiBbMjQ0LCAxNjQsIDk2XSxcclxuXHRcInNlYWdyZWVuXCI6IFs0NiwgMTM5LCA4N10sXHJcblx0XCJzZWFzaGVsbFwiOiBbMjU1LCAyNDUsIDIzOF0sXHJcblx0XCJzaWVubmFcIjogWzE2MCwgODIsIDQ1XSxcclxuXHRcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXHJcblx0XCJza3libHVlXCI6IFsxMzUsIDIwNiwgMjM1XSxcclxuXHRcInNsYXRlYmx1ZVwiOiBbMTA2LCA5MCwgMjA1XSxcclxuXHRcInNsYXRlZ3JheVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbGF0ZWdyZXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic25vd1wiOiBbMjU1LCAyNTAsIDI1MF0sXHJcblx0XCJzcHJpbmdncmVlblwiOiBbMCwgMjU1LCAxMjddLFxyXG5cdFwic3RlZWxibHVlXCI6IFs3MCwgMTMwLCAxODBdLFxyXG5cdFwidGFuXCI6IFsyMTAsIDE4MCwgMTQwXSxcclxuXHRcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcclxuXHRcInRoaXN0bGVcIjogWzIxNiwgMTkxLCAyMTZdLFxyXG5cdFwidG9tYXRvXCI6IFsyNTUsIDk5LCA3MV0sXHJcblx0XCJ0dXJxdW9pc2VcIjogWzY0LCAyMjQsIDIwOF0sXHJcblx0XCJ2aW9sZXRcIjogWzIzOCwgMTMwLCAyMzhdLFxyXG5cdFwid2hlYXRcIjogWzI0NSwgMjIyLCAxNzldLFxyXG5cdFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxyXG5cdFwid2hpdGVzbW9rZVwiOiBbMjQ1LCAyNDUsIDI0NV0sXHJcblx0XCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXSxcclxuXHRcInllbGxvd2dyZWVuXCI6IFsxNTQsIDIwNSwgNTBdXHJcbn07XHJcbiIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY3NzS2V5d29yZHMgPSByZXF1aXJlKCdjb2xvci1uYW1lJyk7XG5cbi8vIE5PVEU6IGNvbnZlcnNpb25zIHNob3VsZCBvbmx5IHJldHVybiBwcmltaXRpdmUgdmFsdWVzIChpLmUuIGFycmF5cywgb3Jcbi8vICAgICAgIHZhbHVlcyB0aGF0IGdpdmUgY29ycmVjdCBgdHlwZW9mYCByZXN1bHRzKS5cbi8vICAgICAgIGRvIG5vdCB1c2UgYm94IHZhbHVlcyB0eXBlcyAoaS5lLiBOdW1iZXIoKSwgU3RyaW5nKCksIGV0Yy4pXG5cbnZhciByZXZlcnNlS2V5d29yZHMgPSB7fTtcbmZvciAodmFyIGtleSBpbiBjc3NLZXl3b3Jkcykge1xuXHRpZiAoY3NzS2V5d29yZHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdHJldmVyc2VLZXl3b3Jkc1tjc3NLZXl3b3Jkc1trZXldXSA9IGtleTtcblx0fVxufVxuXG52YXIgY29udmVydCA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHRyZ2I6IHtjaGFubmVsczogMywgbGFiZWxzOiAncmdiJ30sXG5cdGhzbDoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdoc2wnfSxcblx0aHN2OiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2hzdid9LFxuXHRod2I6IHtjaGFubmVsczogMywgbGFiZWxzOiAnaHdiJ30sXG5cdGNteWs6IHtjaGFubmVsczogNCwgbGFiZWxzOiAnY215ayd9LFxuXHR4eXo6IHtjaGFubmVsczogMywgbGFiZWxzOiAneHl6J30sXG5cdGxhYjoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdsYWInfSxcblx0bGNoOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2xjaCd9LFxuXHRoZXg6IHtjaGFubmVsczogMSwgbGFiZWxzOiBbJ2hleCddfSxcblx0a2V5d29yZDoge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsna2V5d29yZCddfSxcblx0YW5zaTE2OiB7Y2hhbm5lbHM6IDEsIGxhYmVsczogWydhbnNpMTYnXX0sXG5cdGFuc2kyNTY6IHtjaGFubmVsczogMSwgbGFiZWxzOiBbJ2Fuc2kyNTYnXX0sXG5cdGhjZzoge2NoYW5uZWxzOiAzLCBsYWJlbHM6IFsnaCcsICdjJywgJ2cnXX0sXG5cdGFwcGxlOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogWydyMTYnLCAnZzE2JywgJ2IxNiddfSxcblx0Z3JheToge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsnZ3JheSddfVxufTtcblxuLy8gaGlkZSAuY2hhbm5lbHMgYW5kIC5sYWJlbHMgcHJvcGVydGllc1xuZm9yICh2YXIgbW9kZWwgaW4gY29udmVydCkge1xuXHRpZiAoY29udmVydC5oYXNPd25Qcm9wZXJ0eShtb2RlbCkpIHtcblx0XHRpZiAoISgnY2hhbm5lbHMnIGluIGNvbnZlcnRbbW9kZWxdKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGNoYW5uZWxzIHByb3BlcnR5OiAnICsgbW9kZWwpO1xuXHRcdH1cblxuXHRcdGlmICghKCdsYWJlbHMnIGluIGNvbnZlcnRbbW9kZWxdKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGNoYW5uZWwgbGFiZWxzIHByb3BlcnR5OiAnICsgbW9kZWwpO1xuXHRcdH1cblxuXHRcdGlmIChjb252ZXJ0W21vZGVsXS5sYWJlbHMubGVuZ3RoICE9PSBjb252ZXJ0W21vZGVsXS5jaGFubmVscykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdjaGFubmVsIGFuZCBsYWJlbCBjb3VudHMgbWlzbWF0Y2g6ICcgKyBtb2RlbCk7XG5cdFx0fVxuXG5cdFx0dmFyIGNoYW5uZWxzID0gY29udmVydFttb2RlbF0uY2hhbm5lbHM7XG5cdFx0dmFyIGxhYmVscyA9IGNvbnZlcnRbbW9kZWxdLmxhYmVscztcblx0XHRkZWxldGUgY29udmVydFttb2RlbF0uY2hhbm5lbHM7XG5cdFx0ZGVsZXRlIGNvbnZlcnRbbW9kZWxdLmxhYmVscztcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udmVydFttb2RlbF0sICdjaGFubmVscycsIHt2YWx1ZTogY2hhbm5lbHN9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udmVydFttb2RlbF0sICdsYWJlbHMnLCB7dmFsdWU6IGxhYmVsc30pO1xuXHR9XG59XG5cbmNvbnZlcnQucmdiLmhzbCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuXHR2YXIgbWF4ID0gTWF0aC5tYXgociwgZywgYik7XG5cdHZhciBkZWx0YSA9IG1heCAtIG1pbjtcblx0dmFyIGg7XG5cdHZhciBzO1xuXHR2YXIgbDtcblxuXHRpZiAobWF4ID09PSBtaW4pIHtcblx0XHRoID0gMDtcblx0fSBlbHNlIGlmIChyID09PSBtYXgpIHtcblx0XHRoID0gKGcgLSBiKSAvIGRlbHRhO1xuXHR9IGVsc2UgaWYgKGcgPT09IG1heCkge1xuXHRcdGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuXHR9IGVsc2UgaWYgKGIgPT09IG1heCkge1xuXHRcdGggPSA0ICsgKHIgLSBnKSAvIGRlbHRhO1xuXHR9XG5cblx0aCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuXHRpZiAoaCA8IDApIHtcblx0XHRoICs9IDM2MDtcblx0fVxuXG5cdGwgPSAobWluICsgbWF4KSAvIDI7XG5cblx0aWYgKG1heCA9PT0gbWluKSB7XG5cdFx0cyA9IDA7XG5cdH0gZWxzZSBpZiAobCA8PSAwLjUpIHtcblx0XHRzID0gZGVsdGEgLyAobWF4ICsgbWluKTtcblx0fSBlbHNlIHtcblx0XHRzID0gZGVsdGEgLyAoMiAtIG1heCAtIG1pbik7XG5cdH1cblxuXHRyZXR1cm4gW2gsIHMgKiAxMDAsIGwgKiAxMDBdO1xufTtcblxuY29udmVydC5yZ2IuaHN2ID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgcmRpZjtcblx0dmFyIGdkaWY7XG5cdHZhciBiZGlmO1xuXHR2YXIgaDtcblx0dmFyIHM7XG5cblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIHYgPSBNYXRoLm1heChyLCBnLCBiKTtcblx0dmFyIGRpZmYgPSB2IC0gTWF0aC5taW4ociwgZywgYik7XG5cdHZhciBkaWZmYyA9IGZ1bmN0aW9uIChjKSB7XG5cdFx0cmV0dXJuICh2IC0gYykgLyA2IC8gZGlmZiArIDEgLyAyO1xuXHR9O1xuXG5cdGlmIChkaWZmID09PSAwKSB7XG5cdFx0aCA9IHMgPSAwO1xuXHR9IGVsc2Uge1xuXHRcdHMgPSBkaWZmIC8gdjtcblx0XHRyZGlmID0gZGlmZmMocik7XG5cdFx0Z2RpZiA9IGRpZmZjKGcpO1xuXHRcdGJkaWYgPSBkaWZmYyhiKTtcblxuXHRcdGlmIChyID09PSB2KSB7XG5cdFx0XHRoID0gYmRpZiAtIGdkaWY7XG5cdFx0fSBlbHNlIGlmIChnID09PSB2KSB7XG5cdFx0XHRoID0gKDEgLyAzKSArIHJkaWYgLSBiZGlmO1xuXHRcdH0gZWxzZSBpZiAoYiA9PT0gdikge1xuXHRcdFx0aCA9ICgyIC8gMykgKyBnZGlmIC0gcmRpZjtcblx0XHR9XG5cdFx0aWYgKGggPCAwKSB7XG5cdFx0XHRoICs9IDE7XG5cdFx0fSBlbHNlIGlmIChoID4gMSkge1xuXHRcdFx0aCAtPSAxO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBbXG5cdFx0aCAqIDM2MCxcblx0XHRzICogMTAwLFxuXHRcdHYgKiAxMDBcblx0XTtcbn07XG5cbmNvbnZlcnQucmdiLmh3YiA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF07XG5cdHZhciBnID0gcmdiWzFdO1xuXHR2YXIgYiA9IHJnYlsyXTtcblx0dmFyIGggPSBjb252ZXJ0LnJnYi5oc2wocmdiKVswXTtcblx0dmFyIHcgPSAxIC8gMjU1ICogTWF0aC5taW4ociwgTWF0aC5taW4oZywgYikpO1xuXG5cdGIgPSAxIC0gMSAvIDI1NSAqIE1hdGgubWF4KHIsIE1hdGgubWF4KGcsIGIpKTtcblxuXHRyZXR1cm4gW2gsIHcgKiAxMDAsIGIgKiAxMDBdO1xufTtcblxuY29udmVydC5yZ2IuY215ayA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIGM7XG5cdHZhciBtO1xuXHR2YXIgeTtcblx0dmFyIGs7XG5cblx0ayA9IE1hdGgubWluKDEgLSByLCAxIC0gZywgMSAtIGIpO1xuXHRjID0gKDEgLSByIC0gaykgLyAoMSAtIGspIHx8IDA7XG5cdG0gPSAoMSAtIGcgLSBrKSAvICgxIC0gaykgfHwgMDtcblx0eSA9ICgxIC0gYiAtIGspIC8gKDEgLSBrKSB8fCAwO1xuXG5cdHJldHVybiBbYyAqIDEwMCwgbSAqIDEwMCwgeSAqIDEwMCwgayAqIDEwMF07XG59O1xuXG4vKipcbiAqIFNlZSBodHRwczovL2VuLm0ud2lraXBlZGlhLm9yZy93aWtpL0V1Y2xpZGVhbl9kaXN0YW5jZSNTcXVhcmVkX0V1Y2xpZGVhbl9kaXN0YW5jZVxuICogKi9cbmZ1bmN0aW9uIGNvbXBhcmF0aXZlRGlzdGFuY2UoeCwgeSkge1xuXHRyZXR1cm4gKFxuXHRcdE1hdGgucG93KHhbMF0gLSB5WzBdLCAyKSArXG5cdFx0TWF0aC5wb3coeFsxXSAtIHlbMV0sIDIpICtcblx0XHRNYXRoLnBvdyh4WzJdIC0geVsyXSwgMilcblx0KTtcbn1cblxuY29udmVydC5yZ2Iua2V5d29yZCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHJldmVyc2VkID0gcmV2ZXJzZUtleXdvcmRzW3JnYl07XG5cdGlmIChyZXZlcnNlZCkge1xuXHRcdHJldHVybiByZXZlcnNlZDtcblx0fVxuXG5cdHZhciBjdXJyZW50Q2xvc2VzdERpc3RhbmNlID0gSW5maW5pdHk7XG5cdHZhciBjdXJyZW50Q2xvc2VzdEtleXdvcmQ7XG5cblx0Zm9yICh2YXIga2V5d29yZCBpbiBjc3NLZXl3b3Jkcykge1xuXHRcdGlmIChjc3NLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eShrZXl3b3JkKSkge1xuXHRcdFx0dmFyIHZhbHVlID0gY3NzS2V5d29yZHNba2V5d29yZF07XG5cblx0XHRcdC8vIENvbXB1dGUgY29tcGFyYXRpdmUgZGlzdGFuY2Vcblx0XHRcdHZhciBkaXN0YW5jZSA9IGNvbXBhcmF0aXZlRGlzdGFuY2UocmdiLCB2YWx1ZSk7XG5cblx0XHRcdC8vIENoZWNrIGlmIGl0cyBsZXNzLCBpZiBzbyBzZXQgYXMgY2xvc2VzdFxuXHRcdFx0aWYgKGRpc3RhbmNlIDwgY3VycmVudENsb3Nlc3REaXN0YW5jZSkge1xuXHRcdFx0XHRjdXJyZW50Q2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdGN1cnJlbnRDbG9zZXN0S2V5d29yZCA9IGtleXdvcmQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGN1cnJlbnRDbG9zZXN0S2V5d29yZDtcbn07XG5cbmNvbnZlcnQua2V5d29yZC5yZ2IgPSBmdW5jdGlvbiAoa2V5d29yZCkge1xuXHRyZXR1cm4gY3NzS2V5d29yZHNba2V5d29yZF07XG59O1xuXG5jb252ZXJ0LnJnYi54eXogPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciByID0gcmdiWzBdIC8gMjU1O1xuXHR2YXIgZyA9IHJnYlsxXSAvIDI1NTtcblx0dmFyIGIgPSByZ2JbMl0gLyAyNTU7XG5cblx0Ly8gYXNzdW1lIHNSR0Jcblx0ciA9IHIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChyICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKHIgLyAxMi45Mik7XG5cdGcgPSBnID4gMC4wNDA0NSA/IE1hdGgucG93KCgoZyArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChnIC8gMTIuOTIpO1xuXHRiID0gYiA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoYiAvIDEyLjkyKTtcblxuXHR2YXIgeCA9IChyICogMC40MTI0KSArIChnICogMC4zNTc2KSArIChiICogMC4xODA1KTtcblx0dmFyIHkgPSAociAqIDAuMjEyNikgKyAoZyAqIDAuNzE1MikgKyAoYiAqIDAuMDcyMik7XG5cdHZhciB6ID0gKHIgKiAwLjAxOTMpICsgKGcgKiAwLjExOTIpICsgKGIgKiAwLjk1MDUpO1xuXG5cdHJldHVybiBbeCAqIDEwMCwgeSAqIDEwMCwgeiAqIDEwMF07XG59O1xuXG5jb252ZXJ0LnJnYi5sYWIgPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciB4eXogPSBjb252ZXJ0LnJnYi54eXoocmdiKTtcblx0dmFyIHggPSB4eXpbMF07XG5cdHZhciB5ID0geHl6WzFdO1xuXHR2YXIgeiA9IHh5elsyXTtcblx0dmFyIGw7XG5cdHZhciBhO1xuXHR2YXIgYjtcblxuXHR4IC89IDk1LjA0Nztcblx0eSAvPSAxMDA7XG5cdHogLz0gMTA4Ljg4MztcblxuXHR4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMSAvIDMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuXHR5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMSAvIDMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuXHR6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMSAvIDMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG5cdGwgPSAoMTE2ICogeSkgLSAxNjtcblx0YSA9IDUwMCAqICh4IC0geSk7XG5cdGIgPSAyMDAgKiAoeSAtIHopO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59O1xuXG5jb252ZXJ0LmhzbC5yZ2IgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBoID0gaHNsWzBdIC8gMzYwO1xuXHR2YXIgcyA9IGhzbFsxXSAvIDEwMDtcblx0dmFyIGwgPSBoc2xbMl0gLyAxMDA7XG5cdHZhciB0MTtcblx0dmFyIHQyO1xuXHR2YXIgdDM7XG5cdHZhciByZ2I7XG5cdHZhciB2YWw7XG5cblx0aWYgKHMgPT09IDApIHtcblx0XHR2YWwgPSBsICogMjU1O1xuXHRcdHJldHVybiBbdmFsLCB2YWwsIHZhbF07XG5cdH1cblxuXHRpZiAobCA8IDAuNSkge1xuXHRcdHQyID0gbCAqICgxICsgcyk7XG5cdH0gZWxzZSB7XG5cdFx0dDIgPSBsICsgcyAtIGwgKiBzO1xuXHR9XG5cblx0dDEgPSAyICogbCAtIHQyO1xuXG5cdHJnYiA9IFswLCAwLCAwXTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHR0MyA9IGggKyAxIC8gMyAqIC0oaSAtIDEpO1xuXHRcdGlmICh0MyA8IDApIHtcblx0XHRcdHQzKys7XG5cdFx0fVxuXHRcdGlmICh0MyA+IDEpIHtcblx0XHRcdHQzLS07XG5cdFx0fVxuXG5cdFx0aWYgKDYgKiB0MyA8IDEpIHtcblx0XHRcdHZhbCA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzO1xuXHRcdH0gZWxzZSBpZiAoMiAqIHQzIDwgMSkge1xuXHRcdFx0dmFsID0gdDI7XG5cdFx0fSBlbHNlIGlmICgzICogdDMgPCAyKSB7XG5cdFx0XHR2YWwgPSB0MSArICh0MiAtIHQxKSAqICgyIC8gMyAtIHQzKSAqIDY7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbCA9IHQxO1xuXHRcdH1cblxuXHRcdHJnYltpXSA9IHZhbCAqIDI1NTtcblx0fVxuXG5cdHJldHVybiByZ2I7XG59O1xuXG5jb252ZXJ0LmhzbC5oc3YgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBoID0gaHNsWzBdO1xuXHR2YXIgcyA9IGhzbFsxXSAvIDEwMDtcblx0dmFyIGwgPSBoc2xbMl0gLyAxMDA7XG5cdHZhciBzbWluID0gcztcblx0dmFyIGxtaW4gPSBNYXRoLm1heChsLCAwLjAxKTtcblx0dmFyIHN2O1xuXHR2YXIgdjtcblxuXHRsICo9IDI7XG5cdHMgKj0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG5cdHNtaW4gKj0gbG1pbiA8PSAxID8gbG1pbiA6IDIgLSBsbWluO1xuXHR2ID0gKGwgKyBzKSAvIDI7XG5cdHN2ID0gbCA9PT0gMCA/ICgyICogc21pbikgLyAobG1pbiArIHNtaW4pIDogKDIgKiBzKSAvIChsICsgcyk7XG5cblx0cmV0dXJuIFtoLCBzdiAqIDEwMCwgdiAqIDEwMF07XG59O1xuXG5jb252ZXJ0Lmhzdi5yZ2IgPSBmdW5jdGlvbiAoaHN2KSB7XG5cdHZhciBoID0gaHN2WzBdIC8gNjA7XG5cdHZhciBzID0gaHN2WzFdIC8gMTAwO1xuXHR2YXIgdiA9IGhzdlsyXSAvIDEwMDtcblx0dmFyIGhpID0gTWF0aC5mbG9vcihoKSAlIDY7XG5cblx0dmFyIGYgPSBoIC0gTWF0aC5mbG9vcihoKTtcblx0dmFyIHAgPSAyNTUgKiB2ICogKDEgLSBzKTtcblx0dmFyIHEgPSAyNTUgKiB2ICogKDEgLSAocyAqIGYpKTtcblx0dmFyIHQgPSAyNTUgKiB2ICogKDEgLSAocyAqICgxIC0gZikpKTtcblx0diAqPSAyNTU7XG5cblx0c3dpdGNoIChoaSkge1xuXHRcdGNhc2UgMDpcblx0XHRcdHJldHVybiBbdiwgdCwgcF07XG5cdFx0Y2FzZSAxOlxuXHRcdFx0cmV0dXJuIFtxLCB2LCBwXTtcblx0XHRjYXNlIDI6XG5cdFx0XHRyZXR1cm4gW3AsIHYsIHRdO1xuXHRcdGNhc2UgMzpcblx0XHRcdHJldHVybiBbcCwgcSwgdl07XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIFt0LCBwLCB2XTtcblx0XHRjYXNlIDU6XG5cdFx0XHRyZXR1cm4gW3YsIHAsIHFdO1xuXHR9XG59O1xuXG5jb252ZXJ0Lmhzdi5oc2wgPSBmdW5jdGlvbiAoaHN2KSB7XG5cdHZhciBoID0gaHN2WzBdO1xuXHR2YXIgcyA9IGhzdlsxXSAvIDEwMDtcblx0dmFyIHYgPSBoc3ZbMl0gLyAxMDA7XG5cdHZhciB2bWluID0gTWF0aC5tYXgodiwgMC4wMSk7XG5cdHZhciBsbWluO1xuXHR2YXIgc2w7XG5cdHZhciBsO1xuXG5cdGwgPSAoMiAtIHMpICogdjtcblx0bG1pbiA9ICgyIC0gcykgKiB2bWluO1xuXHRzbCA9IHMgKiB2bWluO1xuXHRzbCAvPSAobG1pbiA8PSAxKSA/IGxtaW4gOiAyIC0gbG1pbjtcblx0c2wgPSBzbCB8fCAwO1xuXHRsIC89IDI7XG5cblx0cmV0dXJuIFtoLCBzbCAqIDEwMCwgbCAqIDEwMF07XG59O1xuXG4vLyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtY29sb3IvI2h3Yi10by1yZ2JcbmNvbnZlcnQuaHdiLnJnYiA9IGZ1bmN0aW9uIChod2IpIHtcblx0dmFyIGggPSBod2JbMF0gLyAzNjA7XG5cdHZhciB3aCA9IGh3YlsxXSAvIDEwMDtcblx0dmFyIGJsID0gaHdiWzJdIC8gMTAwO1xuXHR2YXIgcmF0aW8gPSB3aCArIGJsO1xuXHR2YXIgaTtcblx0dmFyIHY7XG5cdHZhciBmO1xuXHR2YXIgbjtcblxuXHQvLyB3aCArIGJsIGNhbnQgYmUgPiAxXG5cdGlmIChyYXRpbyA+IDEpIHtcblx0XHR3aCAvPSByYXRpbztcblx0XHRibCAvPSByYXRpbztcblx0fVxuXG5cdGkgPSBNYXRoLmZsb29yKDYgKiBoKTtcblx0diA9IDEgLSBibDtcblx0ZiA9IDYgKiBoIC0gaTtcblxuXHRpZiAoKGkgJiAweDAxKSAhPT0gMCkge1xuXHRcdGYgPSAxIC0gZjtcblx0fVxuXG5cdG4gPSB3aCArIGYgKiAodiAtIHdoKTsgLy8gbGluZWFyIGludGVycG9sYXRpb25cblxuXHR2YXIgcjtcblx0dmFyIGc7XG5cdHZhciBiO1xuXHRzd2l0Y2ggKGkpIHtcblx0XHRkZWZhdWx0OlxuXHRcdGNhc2UgNjpcblx0XHRjYXNlIDA6IHIgPSB2OyBnID0gbjsgYiA9IHdoOyBicmVhaztcblx0XHRjYXNlIDE6IHIgPSBuOyBnID0gdjsgYiA9IHdoOyBicmVhaztcblx0XHRjYXNlIDI6IHIgPSB3aDsgZyA9IHY7IGIgPSBuOyBicmVhaztcblx0XHRjYXNlIDM6IHIgPSB3aDsgZyA9IG47IGIgPSB2OyBicmVhaztcblx0XHRjYXNlIDQ6IHIgPSBuOyBnID0gd2g7IGIgPSB2OyBicmVhaztcblx0XHRjYXNlIDU6IHIgPSB2OyBnID0gd2g7IGIgPSBuOyBicmVhaztcblx0fVxuXG5cdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59O1xuXG5jb252ZXJ0LmNteWsucmdiID0gZnVuY3Rpb24gKGNteWspIHtcblx0dmFyIGMgPSBjbXlrWzBdIC8gMTAwO1xuXHR2YXIgbSA9IGNteWtbMV0gLyAxMDA7XG5cdHZhciB5ID0gY215a1syXSAvIDEwMDtcblx0dmFyIGsgPSBjbXlrWzNdIC8gMTAwO1xuXHR2YXIgcjtcblx0dmFyIGc7XG5cdHZhciBiO1xuXG5cdHIgPSAxIC0gTWF0aC5taW4oMSwgYyAqICgxIC0gaykgKyBrKTtcblx0ZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspO1xuXHRiID0gMSAtIE1hdGgubWluKDEsIHkgKiAoMSAtIGspICsgayk7XG5cblx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn07XG5cbmNvbnZlcnQueHl6LnJnYiA9IGZ1bmN0aW9uICh4eXopIHtcblx0dmFyIHggPSB4eXpbMF0gLyAxMDA7XG5cdHZhciB5ID0geHl6WzFdIC8gMTAwO1xuXHR2YXIgeiA9IHh5elsyXSAvIDEwMDtcblx0dmFyIHI7XG5cdHZhciBnO1xuXHR2YXIgYjtcblxuXHRyID0gKHggKiAzLjI0MDYpICsgKHkgKiAtMS41MzcyKSArICh6ICogLTAuNDk4Nik7XG5cdGcgPSAoeCAqIC0wLjk2ODkpICsgKHkgKiAxLjg3NTgpICsgKHogKiAwLjA0MTUpO1xuXHRiID0gKHggKiAwLjA1NTcpICsgKHkgKiAtMC4yMDQwKSArICh6ICogMS4wNTcwKTtcblxuXHQvLyBhc3N1bWUgc1JHQlxuXHRyID0gciA+IDAuMDAzMTMwOFxuXHRcdD8gKCgxLjA1NSAqIE1hdGgucG93KHIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG5cdFx0OiByICogMTIuOTI7XG5cblx0ZyA9IGcgPiAwLjAwMzEzMDhcblx0XHQ/ICgoMS4wNTUgKiBNYXRoLnBvdyhnLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuXHRcdDogZyAqIDEyLjkyO1xuXG5cdGIgPSBiID4gMC4wMDMxMzA4XG5cdFx0PyAoKDEuMDU1ICogTWF0aC5wb3coYiwgMS4wIC8gMi40KSkgLSAwLjA1NSlcblx0XHQ6IGIgKiAxMi45MjtcblxuXHRyID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgciksIDEpO1xuXHRnID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgZyksIDEpO1xuXHRiID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgYiksIDEpO1xuXG5cdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59O1xuXG5jb252ZXJ0Lnh5ei5sYWIgPSBmdW5jdGlvbiAoeHl6KSB7XG5cdHZhciB4ID0geHl6WzBdO1xuXHR2YXIgeSA9IHh5elsxXTtcblx0dmFyIHogPSB4eXpbMl07XG5cdHZhciBsO1xuXHR2YXIgYTtcblx0dmFyIGI7XG5cblx0eCAvPSA5NS4wNDc7XG5cdHkgLz0gMTAwO1xuXHR6IC89IDEwOC44ODM7XG5cblx0eCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEgLyAzKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcblx0eSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEgLyAzKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcblx0eiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEgLyAzKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuXHRsID0gKDExNiAqIHkpIC0gMTY7XG5cdGEgPSA1MDAgKiAoeCAtIHkpO1xuXHRiID0gMjAwICogKHkgLSB6KTtcblxuXHRyZXR1cm4gW2wsIGEsIGJdO1xufTtcblxuY29udmVydC5sYWIueHl6ID0gZnVuY3Rpb24gKGxhYikge1xuXHR2YXIgbCA9IGxhYlswXTtcblx0dmFyIGEgPSBsYWJbMV07XG5cdHZhciBiID0gbGFiWzJdO1xuXHR2YXIgeDtcblx0dmFyIHk7XG5cdHZhciB6O1xuXG5cdHkgPSAobCArIDE2KSAvIDExNjtcblx0eCA9IGEgLyA1MDAgKyB5O1xuXHR6ID0geSAtIGIgLyAyMDA7XG5cblx0dmFyIHkyID0gTWF0aC5wb3coeSwgMyk7XG5cdHZhciB4MiA9IE1hdGgucG93KHgsIDMpO1xuXHR2YXIgejIgPSBNYXRoLnBvdyh6LCAzKTtcblx0eSA9IHkyID4gMC4wMDg4NTYgPyB5MiA6ICh5IC0gMTYgLyAxMTYpIC8gNy43ODc7XG5cdHggPSB4MiA+IDAuMDA4ODU2ID8geDIgOiAoeCAtIDE2IC8gMTE2KSAvIDcuNzg3O1xuXHR6ID0gejIgPiAwLjAwODg1NiA/IHoyIDogKHogLSAxNiAvIDExNikgLyA3Ljc4NztcblxuXHR4ICo9IDk1LjA0Nztcblx0eSAqPSAxMDA7XG5cdHogKj0gMTA4Ljg4MztcblxuXHRyZXR1cm4gW3gsIHksIHpdO1xufTtcblxuY29udmVydC5sYWIubGNoID0gZnVuY3Rpb24gKGxhYikge1xuXHR2YXIgbCA9IGxhYlswXTtcblx0dmFyIGEgPSBsYWJbMV07XG5cdHZhciBiID0gbGFiWzJdO1xuXHR2YXIgaHI7XG5cdHZhciBoO1xuXHR2YXIgYztcblxuXHRociA9IE1hdGguYXRhbjIoYiwgYSk7XG5cdGggPSBociAqIDM2MCAvIDIgLyBNYXRoLlBJO1xuXG5cdGlmIChoIDwgMCkge1xuXHRcdGggKz0gMzYwO1xuXHR9XG5cblx0YyA9IE1hdGguc3FydChhICogYSArIGIgKiBiKTtcblxuXHRyZXR1cm4gW2wsIGMsIGhdO1xufTtcblxuY29udmVydC5sY2gubGFiID0gZnVuY3Rpb24gKGxjaCkge1xuXHR2YXIgbCA9IGxjaFswXTtcblx0dmFyIGMgPSBsY2hbMV07XG5cdHZhciBoID0gbGNoWzJdO1xuXHR2YXIgYTtcblx0dmFyIGI7XG5cdHZhciBocjtcblxuXHRociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcblx0YSA9IGMgKiBNYXRoLmNvcyhocik7XG5cdGIgPSBjICogTWF0aC5zaW4oaHIpO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59O1xuXG5jb252ZXJ0LnJnYi5hbnNpMTYgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgciA9IGFyZ3NbMF07XG5cdHZhciBnID0gYXJnc1sxXTtcblx0dmFyIGIgPSBhcmdzWzJdO1xuXHR2YXIgdmFsdWUgPSAxIGluIGFyZ3VtZW50cyA/IGFyZ3VtZW50c1sxXSA6IGNvbnZlcnQucmdiLmhzdihhcmdzKVsyXTsgLy8gaHN2IC0+IGFuc2kxNiBvcHRpbWl6YXRpb25cblxuXHR2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgLyA1MCk7XG5cblx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0cmV0dXJuIDMwO1xuXHR9XG5cblx0dmFyIGFuc2kgPSAzMFxuXHRcdCsgKChNYXRoLnJvdW5kKGIgLyAyNTUpIDw8IDIpXG5cdFx0fCAoTWF0aC5yb3VuZChnIC8gMjU1KSA8PCAxKVxuXHRcdHwgTWF0aC5yb3VuZChyIC8gMjU1KSk7XG5cblx0aWYgKHZhbHVlID09PSAyKSB7XG5cdFx0YW5zaSArPSA2MDtcblx0fVxuXG5cdHJldHVybiBhbnNpO1xufTtcblxuY29udmVydC5oc3YuYW5zaTE2ID0gZnVuY3Rpb24gKGFyZ3MpIHtcblx0Ly8gb3B0aW1pemF0aW9uIGhlcmU7IHdlIGFscmVhZHkga25vdyB0aGUgdmFsdWUgYW5kIGRvbid0IG5lZWQgdG8gZ2V0XG5cdC8vIGl0IGNvbnZlcnRlZCBmb3IgdXMuXG5cdHJldHVybiBjb252ZXJ0LnJnYi5hbnNpMTYoY29udmVydC5oc3YucmdiKGFyZ3MpLCBhcmdzWzJdKTtcbn07XG5cbmNvbnZlcnQucmdiLmFuc2kyNTYgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgciA9IGFyZ3NbMF07XG5cdHZhciBnID0gYXJnc1sxXTtcblx0dmFyIGIgPSBhcmdzWzJdO1xuXG5cdC8vIHdlIHVzZSB0aGUgZXh0ZW5kZWQgZ3JleXNjYWxlIHBhbGV0dGUgaGVyZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG5cdC8vIGJsYWNrIGFuZCB3aGl0ZS4gbm9ybWFsIHBhbGV0dGUgb25seSBoYXMgNCBncmV5c2NhbGUgc2hhZGVzLlxuXHRpZiAociA9PT0gZyAmJiBnID09PSBiKSB7XG5cdFx0aWYgKHIgPCA4KSB7XG5cdFx0XHRyZXR1cm4gMTY7XG5cdFx0fVxuXG5cdFx0aWYgKHIgPiAyNDgpIHtcblx0XHRcdHJldHVybiAyMzE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKChyIC0gOCkgLyAyNDcpICogMjQpICsgMjMyO1xuXHR9XG5cblx0dmFyIGFuc2kgPSAxNlxuXHRcdCsgKDM2ICogTWF0aC5yb3VuZChyIC8gMjU1ICogNSkpXG5cdFx0KyAoNiAqIE1hdGgucm91bmQoZyAvIDI1NSAqIDUpKVxuXHRcdCsgTWF0aC5yb3VuZChiIC8gMjU1ICogNSk7XG5cblx0cmV0dXJuIGFuc2k7XG59O1xuXG5jb252ZXJ0LmFuc2kxNi5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgY29sb3IgPSBhcmdzICUgMTA7XG5cblx0Ly8gaGFuZGxlIGdyZXlzY2FsZVxuXHRpZiAoY29sb3IgPT09IDAgfHwgY29sb3IgPT09IDcpIHtcblx0XHRpZiAoYXJncyA+IDUwKSB7XG5cdFx0XHRjb2xvciArPSAzLjU7XG5cdFx0fVxuXG5cdFx0Y29sb3IgPSBjb2xvciAvIDEwLjUgKiAyNTU7XG5cblx0XHRyZXR1cm4gW2NvbG9yLCBjb2xvciwgY29sb3JdO1xuXHR9XG5cblx0dmFyIG11bHQgPSAofn4oYXJncyA+IDUwKSArIDEpICogMC41O1xuXHR2YXIgciA9ICgoY29sb3IgJiAxKSAqIG11bHQpICogMjU1O1xuXHR2YXIgZyA9ICgoKGNvbG9yID4+IDEpICYgMSkgKiBtdWx0KSAqIDI1NTtcblx0dmFyIGIgPSAoKChjb2xvciA+PiAyKSAmIDEpICogbXVsdCkgKiAyNTU7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQuYW5zaTI1Ni5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHQvLyBoYW5kbGUgZ3JleXNjYWxlXG5cdGlmIChhcmdzID49IDIzMikge1xuXHRcdHZhciBjID0gKGFyZ3MgLSAyMzIpICogMTAgKyA4O1xuXHRcdHJldHVybiBbYywgYywgY107XG5cdH1cblxuXHRhcmdzIC09IDE2O1xuXG5cdHZhciByZW07XG5cdHZhciByID0gTWF0aC5mbG9vcihhcmdzIC8gMzYpIC8gNSAqIDI1NTtcblx0dmFyIGcgPSBNYXRoLmZsb29yKChyZW0gPSBhcmdzICUgMzYpIC8gNikgLyA1ICogMjU1O1xuXHR2YXIgYiA9IChyZW0gJSA2KSAvIDUgKiAyNTU7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQucmdiLmhleCA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciBpbnRlZ2VyID0gKChNYXRoLnJvdW5kKGFyZ3NbMF0pICYgMHhGRikgPDwgMTYpXG5cdFx0KyAoKE1hdGgucm91bmQoYXJnc1sxXSkgJiAweEZGKSA8PCA4KVxuXHRcdCsgKE1hdGgucm91bmQoYXJnc1syXSkgJiAweEZGKTtcblxuXHR2YXIgc3RyaW5nID0gaW50ZWdlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblx0cmV0dXJuICcwMDAwMDAnLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKSArIHN0cmluZztcbn07XG5cbmNvbnZlcnQuaGV4LnJnYiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciBtYXRjaCA9IGFyZ3MudG9TdHJpbmcoMTYpLm1hdGNoKC9bYS1mMC05XXs2fXxbYS1mMC05XXszfS9pKTtcblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBbMCwgMCwgMF07XG5cdH1cblxuXHR2YXIgY29sb3JTdHJpbmcgPSBtYXRjaFswXTtcblxuXHRpZiAobWF0Y2hbMF0ubGVuZ3RoID09PSAzKSB7XG5cdFx0Y29sb3JTdHJpbmcgPSBjb2xvclN0cmluZy5zcGxpdCgnJykubWFwKGZ1bmN0aW9uIChjaGFyKSB7XG5cdFx0XHRyZXR1cm4gY2hhciArIGNoYXI7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHR2YXIgaW50ZWdlciA9IHBhcnNlSW50KGNvbG9yU3RyaW5nLCAxNik7XG5cdHZhciByID0gKGludGVnZXIgPj4gMTYpICYgMHhGRjtcblx0dmFyIGcgPSAoaW50ZWdlciA+PiA4KSAmIDB4RkY7XG5cdHZhciBiID0gaW50ZWdlciAmIDB4RkY7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQucmdiLmhjZyA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIG1heCA9IE1hdGgubWF4KE1hdGgubWF4KHIsIGcpLCBiKTtcblx0dmFyIG1pbiA9IE1hdGgubWluKE1hdGgubWluKHIsIGcpLCBiKTtcblx0dmFyIGNocm9tYSA9IChtYXggLSBtaW4pO1xuXHR2YXIgZ3JheXNjYWxlO1xuXHR2YXIgaHVlO1xuXG5cdGlmIChjaHJvbWEgPCAxKSB7XG5cdFx0Z3JheXNjYWxlID0gbWluIC8gKDEgLSBjaHJvbWEpO1xuXHR9IGVsc2Uge1xuXHRcdGdyYXlzY2FsZSA9IDA7XG5cdH1cblxuXHRpZiAoY2hyb21hIDw9IDApIHtcblx0XHRodWUgPSAwO1xuXHR9IGVsc2Vcblx0aWYgKG1heCA9PT0gcikge1xuXHRcdGh1ZSA9ICgoZyAtIGIpIC8gY2hyb21hKSAlIDY7XG5cdH0gZWxzZVxuXHRpZiAobWF4ID09PSBnKSB7XG5cdFx0aHVlID0gMiArIChiIC0gcikgLyBjaHJvbWE7XG5cdH0gZWxzZSB7XG5cdFx0aHVlID0gNCArIChyIC0gZykgLyBjaHJvbWEgKyA0O1xuXHR9XG5cblx0aHVlIC89IDY7XG5cdGh1ZSAlPSAxO1xuXG5cdHJldHVybiBbaHVlICogMzYwLCBjaHJvbWEgKiAxMDAsIGdyYXlzY2FsZSAqIDEwMF07XG59O1xuXG5jb252ZXJ0LmhzbC5oY2cgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBzID0gaHNsWzFdIC8gMTAwO1xuXHR2YXIgbCA9IGhzbFsyXSAvIDEwMDtcblx0dmFyIGMgPSAxO1xuXHR2YXIgZiA9IDA7XG5cblx0aWYgKGwgPCAwLjUpIHtcblx0XHRjID0gMi4wICogcyAqIGw7XG5cdH0gZWxzZSB7XG5cdFx0YyA9IDIuMCAqIHMgKiAoMS4wIC0gbCk7XG5cdH1cblxuXHRpZiAoYyA8IDEuMCkge1xuXHRcdGYgPSAobCAtIDAuNSAqIGMpIC8gKDEuMCAtIGMpO1xuXHR9XG5cblx0cmV0dXJuIFtoc2xbMF0sIGMgKiAxMDAsIGYgKiAxMDBdO1xufTtcblxuY29udmVydC5oc3YuaGNnID0gZnVuY3Rpb24gKGhzdikge1xuXHR2YXIgcyA9IGhzdlsxXSAvIDEwMDtcblx0dmFyIHYgPSBoc3ZbMl0gLyAxMDA7XG5cblx0dmFyIGMgPSBzICogdjtcblx0dmFyIGYgPSAwO1xuXG5cdGlmIChjIDwgMS4wKSB7XG5cdFx0ZiA9ICh2IC0gYykgLyAoMSAtIGMpO1xuXHR9XG5cblx0cmV0dXJuIFtoc3ZbMF0sIGMgKiAxMDAsIGYgKiAxMDBdO1xufTtcblxuY29udmVydC5oY2cucmdiID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgaCA9IGhjZ1swXSAvIDM2MDtcblx0dmFyIGMgPSBoY2dbMV0gLyAxMDA7XG5cdHZhciBnID0gaGNnWzJdIC8gMTAwO1xuXG5cdGlmIChjID09PSAwLjApIHtcblx0XHRyZXR1cm4gW2cgKiAyNTUsIGcgKiAyNTUsIGcgKiAyNTVdO1xuXHR9XG5cblx0dmFyIHB1cmUgPSBbMCwgMCwgMF07XG5cdHZhciBoaSA9IChoICUgMSkgKiA2O1xuXHR2YXIgdiA9IGhpICUgMTtcblx0dmFyIHcgPSAxIC0gdjtcblx0dmFyIG1nID0gMDtcblxuXHRzd2l0Y2ggKE1hdGguZmxvb3IoaGkpKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0cHVyZVswXSA9IDE7IHB1cmVbMV0gPSB2OyBwdXJlWzJdID0gMDsgYnJlYWs7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0cHVyZVswXSA9IHc7IHB1cmVbMV0gPSAxOyBwdXJlWzJdID0gMDsgYnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0cHVyZVswXSA9IDA7IHB1cmVbMV0gPSAxOyBwdXJlWzJdID0gdjsgYnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cHVyZVswXSA9IDA7IHB1cmVbMV0gPSB3OyBwdXJlWzJdID0gMTsgYnJlYWs7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cHVyZVswXSA9IHY7IHB1cmVbMV0gPSAwOyBwdXJlWzJdID0gMTsgYnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHB1cmVbMF0gPSAxOyBwdXJlWzFdID0gMDsgcHVyZVsyXSA9IHc7XG5cdH1cblxuXHRtZyA9ICgxLjAgLSBjKSAqIGc7XG5cblx0cmV0dXJuIFtcblx0XHQoYyAqIHB1cmVbMF0gKyBtZykgKiAyNTUsXG5cdFx0KGMgKiBwdXJlWzFdICsgbWcpICogMjU1LFxuXHRcdChjICogcHVyZVsyXSArIG1nKSAqIDI1NVxuXHRdO1xufTtcblxuY29udmVydC5oY2cuaHN2ID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cblx0dmFyIHYgPSBjICsgZyAqICgxLjAgLSBjKTtcblx0dmFyIGYgPSAwO1xuXG5cdGlmICh2ID4gMC4wKSB7XG5cdFx0ZiA9IGMgLyB2O1xuXHR9XG5cblx0cmV0dXJuIFtoY2dbMF0sIGYgKiAxMDAsIHYgKiAxMDBdO1xufTtcblxuY29udmVydC5oY2cuaHNsID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cblx0dmFyIGwgPSBnICogKDEuMCAtIGMpICsgMC41ICogYztcblx0dmFyIHMgPSAwO1xuXG5cdGlmIChsID4gMC4wICYmIGwgPCAwLjUpIHtcblx0XHRzID0gYyAvICgyICogbCk7XG5cdH0gZWxzZVxuXHRpZiAobCA+PSAwLjUgJiYgbCA8IDEuMCkge1xuXHRcdHMgPSBjIC8gKDIgKiAoMSAtIGwpKTtcblx0fVxuXG5cdHJldHVybiBbaGNnWzBdLCBzICogMTAwLCBsICogMTAwXTtcbn07XG5cbmNvbnZlcnQuaGNnLmh3YiA9IGZ1bmN0aW9uIChoY2cpIHtcblx0dmFyIGMgPSBoY2dbMV0gLyAxMDA7XG5cdHZhciBnID0gaGNnWzJdIC8gMTAwO1xuXHR2YXIgdiA9IGMgKyBnICogKDEuMCAtIGMpO1xuXHRyZXR1cm4gW2hjZ1swXSwgKHYgLSBjKSAqIDEwMCwgKDEgLSB2KSAqIDEwMF07XG59O1xuXG5jb252ZXJ0Lmh3Yi5oY2cgPSBmdW5jdGlvbiAoaHdiKSB7XG5cdHZhciB3ID0gaHdiWzFdIC8gMTAwO1xuXHR2YXIgYiA9IGh3YlsyXSAvIDEwMDtcblx0dmFyIHYgPSAxIC0gYjtcblx0dmFyIGMgPSB2IC0gdztcblx0dmFyIGcgPSAwO1xuXG5cdGlmIChjIDwgMSkge1xuXHRcdGcgPSAodiAtIGMpIC8gKDEgLSBjKTtcblx0fVxuXG5cdHJldHVybiBbaHdiWzBdLCBjICogMTAwLCBnICogMTAwXTtcbn07XG5cbmNvbnZlcnQuYXBwbGUucmdiID0gZnVuY3Rpb24gKGFwcGxlKSB7XG5cdHJldHVybiBbKGFwcGxlWzBdIC8gNjU1MzUpICogMjU1LCAoYXBwbGVbMV0gLyA2NTUzNSkgKiAyNTUsIChhcHBsZVsyXSAvIDY1NTM1KSAqIDI1NV07XG59O1xuXG5jb252ZXJ0LnJnYi5hcHBsZSA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0cmV0dXJuIFsocmdiWzBdIC8gMjU1KSAqIDY1NTM1LCAocmdiWzFdIC8gMjU1KSAqIDY1NTM1LCAocmdiWzJdIC8gMjU1KSAqIDY1NTM1XTtcbn07XG5cbmNvbnZlcnQuZ3JheS5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHRyZXR1cm4gW2FyZ3NbMF0gLyAxMDAgKiAyNTUsIGFyZ3NbMF0gLyAxMDAgKiAyNTUsIGFyZ3NbMF0gLyAxMDAgKiAyNTVdO1xufTtcblxuY29udmVydC5ncmF5LmhzbCA9IGNvbnZlcnQuZ3JheS5oc3YgPSBmdW5jdGlvbiAoYXJncykge1xuXHRyZXR1cm4gWzAsIDAsIGFyZ3NbMF1dO1xufTtcblxuY29udmVydC5ncmF5Lmh3YiA9IGZ1bmN0aW9uIChncmF5KSB7XG5cdHJldHVybiBbMCwgMTAwLCBncmF5WzBdXTtcbn07XG5cbmNvbnZlcnQuZ3JheS5jbXlrID0gZnVuY3Rpb24gKGdyYXkpIHtcblx0cmV0dXJuIFswLCAwLCAwLCBncmF5WzBdXTtcbn07XG5cbmNvbnZlcnQuZ3JheS5sYWIgPSBmdW5jdGlvbiAoZ3JheSkge1xuXHRyZXR1cm4gW2dyYXlbMF0sIDAsIDBdO1xufTtcblxuY29udmVydC5ncmF5LmhleCA9IGZ1bmN0aW9uIChncmF5KSB7XG5cdHZhciB2YWwgPSBNYXRoLnJvdW5kKGdyYXlbMF0gLyAxMDAgKiAyNTUpICYgMHhGRjtcblx0dmFyIGludGVnZXIgPSAodmFsIDw8IDE2KSArICh2YWwgPDwgOCkgKyB2YWw7XG5cblx0dmFyIHN0cmluZyA9IGludGVnZXIudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdHJldHVybiAnMDAwMDAwJy5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCkgKyBzdHJpbmc7XG59O1xuXG5jb252ZXJ0LnJnYi5ncmF5ID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgdmFsID0gKHJnYlswXSArIHJnYlsxXSArIHJnYlsyXSkgLyAzO1xuXHRyZXR1cm4gW3ZhbCAvIDI1NSAqIDEwMF07XG59O1xuIiwidmFyIGNvbnZlcnNpb25zID0gcmVxdWlyZSgnLi9jb252ZXJzaW9ucycpO1xuXG4vKlxuXHR0aGlzIGZ1bmN0aW9uIHJvdXRlcyBhIG1vZGVsIHRvIGFsbCBvdGhlciBtb2RlbHMuXG5cblx0YWxsIGZ1bmN0aW9ucyB0aGF0IGFyZSByb3V0ZWQgaGF2ZSBhIHByb3BlcnR5IGAuY29udmVyc2lvbmAgYXR0YWNoZWRcblx0dG8gdGhlIHJldHVybmVkIHN5bnRoZXRpYyBmdW5jdGlvbi4gVGhpcyBwcm9wZXJ0eSBpcyBhbiBhcnJheVxuXHRvZiBzdHJpbmdzLCBlYWNoIHdpdGggdGhlIHN0ZXBzIGluIGJldHdlZW4gdGhlICdmcm9tJyBhbmQgJ3RvJ1xuXHRjb2xvciBtb2RlbHMgKGluY2x1c2l2ZSkuXG5cblx0Y29udmVyc2lvbnMgdGhhdCBhcmUgbm90IHBvc3NpYmxlIHNpbXBseSBhcmUgbm90IGluY2x1ZGVkLlxuKi9cblxuZnVuY3Rpb24gYnVpbGRHcmFwaCgpIHtcblx0dmFyIGdyYXBoID0ge307XG5cdC8vIGh0dHBzOi8vanNwZXJmLmNvbS9vYmplY3Qta2V5cy12cy1mb3ItaW4td2l0aC1jbG9zdXJlLzNcblx0dmFyIG1vZGVscyA9IE9iamVjdC5rZXlzKGNvbnZlcnNpb25zKTtcblxuXHRmb3IgKHZhciBsZW4gPSBtb2RlbHMubGVuZ3RoLCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0Z3JhcGhbbW9kZWxzW2ldXSA9IHtcblx0XHRcdC8vIGh0dHA6Ly9qc3BlcmYuY29tLzEtdnMtaW5maW5pdHlcblx0XHRcdC8vIG1pY3JvLW9wdCwgYnV0IHRoaXMgaXMgc2ltcGxlLlxuXHRcdFx0ZGlzdGFuY2U6IC0xLFxuXHRcdFx0cGFyZW50OiBudWxsXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBncmFwaDtcbn1cblxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQnJlYWR0aC1maXJzdF9zZWFyY2hcbmZ1bmN0aW9uIGRlcml2ZUJGUyhmcm9tTW9kZWwpIHtcblx0dmFyIGdyYXBoID0gYnVpbGRHcmFwaCgpO1xuXHR2YXIgcXVldWUgPSBbZnJvbU1vZGVsXTsgLy8gdW5zaGlmdCAtPiBxdWV1ZSAtPiBwb3BcblxuXHRncmFwaFtmcm9tTW9kZWxdLmRpc3RhbmNlID0gMDtcblxuXHR3aGlsZSAocXVldWUubGVuZ3RoKSB7XG5cdFx0dmFyIGN1cnJlbnQgPSBxdWV1ZS5wb3AoKTtcblx0XHR2YXIgYWRqYWNlbnRzID0gT2JqZWN0LmtleXMoY29udmVyc2lvbnNbY3VycmVudF0pO1xuXG5cdFx0Zm9yICh2YXIgbGVuID0gYWRqYWNlbnRzLmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dmFyIGFkamFjZW50ID0gYWRqYWNlbnRzW2ldO1xuXHRcdFx0dmFyIG5vZGUgPSBncmFwaFthZGphY2VudF07XG5cblx0XHRcdGlmIChub2RlLmRpc3RhbmNlID09PSAtMSkge1xuXHRcdFx0XHRub2RlLmRpc3RhbmNlID0gZ3JhcGhbY3VycmVudF0uZGlzdGFuY2UgKyAxO1xuXHRcdFx0XHRub2RlLnBhcmVudCA9IGN1cnJlbnQ7XG5cdFx0XHRcdHF1ZXVlLnVuc2hpZnQoYWRqYWNlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBncmFwaDtcbn1cblxuZnVuY3Rpb24gbGluayhmcm9tLCB0bykge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGFyZ3MpIHtcblx0XHRyZXR1cm4gdG8oZnJvbShhcmdzKSk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHdyYXBDb252ZXJzaW9uKHRvTW9kZWwsIGdyYXBoKSB7XG5cdHZhciBwYXRoID0gW2dyYXBoW3RvTW9kZWxdLnBhcmVudCwgdG9Nb2RlbF07XG5cdHZhciBmbiA9IGNvbnZlcnNpb25zW2dyYXBoW3RvTW9kZWxdLnBhcmVudF1bdG9Nb2RlbF07XG5cblx0dmFyIGN1ciA9IGdyYXBoW3RvTW9kZWxdLnBhcmVudDtcblx0d2hpbGUgKGdyYXBoW2N1cl0ucGFyZW50KSB7XG5cdFx0cGF0aC51bnNoaWZ0KGdyYXBoW2N1cl0ucGFyZW50KTtcblx0XHRmbiA9IGxpbmsoY29udmVyc2lvbnNbZ3JhcGhbY3VyXS5wYXJlbnRdW2N1cl0sIGZuKTtcblx0XHRjdXIgPSBncmFwaFtjdXJdLnBhcmVudDtcblx0fVxuXG5cdGZuLmNvbnZlcnNpb24gPSBwYXRoO1xuXHRyZXR1cm4gZm47XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZyb21Nb2RlbCkge1xuXHR2YXIgZ3JhcGggPSBkZXJpdmVCRlMoZnJvbU1vZGVsKTtcblx0dmFyIGNvbnZlcnNpb24gPSB7fTtcblxuXHR2YXIgbW9kZWxzID0gT2JqZWN0LmtleXMoZ3JhcGgpO1xuXHRmb3IgKHZhciBsZW4gPSBtb2RlbHMubGVuZ3RoLCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0dmFyIHRvTW9kZWwgPSBtb2RlbHNbaV07XG5cdFx0dmFyIG5vZGUgPSBncmFwaFt0b01vZGVsXTtcblxuXHRcdGlmIChub2RlLnBhcmVudCA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gbm8gcG9zc2libGUgY29udmVyc2lvbiwgb3IgdGhpcyBub2RlIGlzIHRoZSBzb3VyY2UgbW9kZWwuXG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb252ZXJzaW9uW3RvTW9kZWxdID0gd3JhcENvbnZlcnNpb24odG9Nb2RlbCwgZ3JhcGgpO1xuXHR9XG5cblx0cmV0dXJuIGNvbnZlcnNpb247XG59O1xuXG4iLCJ2YXIgY29udmVyc2lvbnMgPSByZXF1aXJlKCcuL2NvbnZlcnNpb25zJyk7XG52YXIgcm91dGUgPSByZXF1aXJlKCcuL3JvdXRlJyk7XG5cbnZhciBjb252ZXJ0ID0ge307XG5cbnZhciBtb2RlbHMgPSBPYmplY3Qua2V5cyhjb252ZXJzaW9ucyk7XG5cbmZ1bmN0aW9uIHdyYXBSYXcoZm4pIHtcblx0dmFyIHdyYXBwZWRGbiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdFx0aWYgKGFyZ3MgPT09IHVuZGVmaW5lZCB8fCBhcmdzID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gYXJncztcblx0XHR9XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmbihhcmdzKTtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbmZ1bmN0aW9uIHdyYXBSb3VuZGVkKGZuKSB7XG5cdHZhciB3cmFwcGVkRm4gPSBmdW5jdGlvbiAoYXJncykge1xuXHRcdGlmIChhcmdzID09PSB1bmRlZmluZWQgfHwgYXJncyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGFyZ3M7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0ID0gZm4oYXJncyk7XG5cblx0XHQvLyB3ZSdyZSBhc3N1bWluZyB0aGUgcmVzdWx0IGlzIGFuIGFycmF5IGhlcmUuXG5cdFx0Ly8gc2VlIG5vdGljZSBpbiBjb252ZXJzaW9ucy5qczsgZG9uJ3QgdXNlIGJveCB0eXBlc1xuXHRcdC8vIGluIGNvbnZlcnNpb24gZnVuY3Rpb25zLlxuXHRcdGlmICh0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0Zm9yICh2YXIgbGVuID0gcmVzdWx0Lmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChmcm9tTW9kZWwpIHtcblx0Y29udmVydFtmcm9tTW9kZWxdID0ge307XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnZlcnRbZnJvbU1vZGVsXSwgJ2NoYW5uZWxzJywge3ZhbHVlOiBjb252ZXJzaW9uc1tmcm9tTW9kZWxdLmNoYW5uZWxzfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb252ZXJ0W2Zyb21Nb2RlbF0sICdsYWJlbHMnLCB7dmFsdWU6IGNvbnZlcnNpb25zW2Zyb21Nb2RlbF0ubGFiZWxzfSk7XG5cblx0dmFyIHJvdXRlcyA9IHJvdXRlKGZyb21Nb2RlbCk7XG5cdHZhciByb3V0ZU1vZGVscyA9IE9iamVjdC5rZXlzKHJvdXRlcyk7XG5cblx0cm91dGVNb2RlbHMuZm9yRWFjaChmdW5jdGlvbiAodG9Nb2RlbCkge1xuXHRcdHZhciBmbiA9IHJvdXRlc1t0b01vZGVsXTtcblxuXHRcdGNvbnZlcnRbZnJvbU1vZGVsXVt0b01vZGVsXSA9IHdyYXBSb3VuZGVkKGZuKTtcblx0XHRjb252ZXJ0W2Zyb21Nb2RlbF1bdG9Nb2RlbF0ucmF3ID0gd3JhcFJhdyhmbik7XG5cdH0pO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udmVydDtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxMiBIZWF0aGVyIEFydGh1clxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbi8vIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbi8vIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuLy8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuLy8gaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4vLyBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG4vLyBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXG4vLyBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXG4vLyBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGNvbG9yU3RyaW5nID0gcmVxdWlyZShcImNvbG9yLXN0cmluZ1wiKTtcbnZhciBjb252ZXJ0ID0gcmVxdWlyZShcImNvbG9yLWNvbnZlcnRcIik7XG5cbnZhciBfc2xpY2UgPSBbXS5zbGljZTtcblxudmFyIHNraXBwZWRNb2RlbHMgPSBbXG4gIC8vIHRvIGJlIGhvbmVzdCwgSSBkb24ndCByZWFsbHkgZmVlbCBsaWtlIGtleXdvcmQgYmVsb25ncyBpbiBjb2xvciBjb252ZXJ0LCBidXQgZWguXG4gIFwia2V5d29yZFwiLFxuXG4gIC8vIGdyYXkgY29uZmxpY3RzIHdpdGggc29tZSBtZXRob2QgbmFtZXMsIGFuZCBoYXMgaXRzIG93biBtZXRob2QgZGVmaW5lZC5cbiAgXCJncmF5XCIsXG5cbiAgLy8gc2hvdWxkbid0IHJlYWxseSBiZSBpbiBjb2xvci1jb252ZXJ0IGVpdGhlci4uLlxuICBcImhleFwiLFxuXTtcblxudmFyIGhhc2hlZE1vZGVsS2V5cyA9IHt9O1xuT2JqZWN0LmtleXMoY29udmVydCkuZm9yRWFjaChmdW5jdGlvbiAobW9kZWwpIHtcbiAgaGFzaGVkTW9kZWxLZXlzW19zbGljZS5jYWxsKGNvbnZlcnRbbW9kZWxdLmxhYmVscykuc29ydCgpLmpvaW4oXCJcIildID0gbW9kZWw7XG59KTtcblxudmFyIGxpbWl0ZXJzID0ge307XG5cbmZ1bmN0aW9uIENvbG9yKG9iaiwgbW9kZWwpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENvbG9yKSkge1xuICAgIHJldHVybiBuZXcgQ29sb3Iob2JqLCBtb2RlbCk7XG4gIH1cblxuICBpZiAobW9kZWwgJiYgbW9kZWwgaW4gc2tpcHBlZE1vZGVscykge1xuICAgIG1vZGVsID0gbnVsbDtcbiAgfVxuXG4gIGlmIChtb2RlbCAmJiAhKG1vZGVsIGluIGNvbnZlcnQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBtb2RlbDogXCIgKyBtb2RlbCk7XG4gIH1cblxuICB2YXIgaTtcbiAgdmFyIGNoYW5uZWxzO1xuXG4gIGlmIChvYmogPT0gbnVsbCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCxlcWVxZXFcbiAgICB0aGlzLm1vZGVsID0gXCJyZ2JcIjtcbiAgICB0aGlzLmNvbG9yID0gWzAsIDAsIDBdO1xuICAgIHRoaXMudmFscGhhID0gMTtcbiAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBDb2xvcikge1xuICAgIHRoaXMubW9kZWwgPSBvYmoubW9kZWw7XG4gICAgdGhpcy5jb2xvciA9IG9iai5jb2xvci5zbGljZSgpO1xuICAgIHRoaXMudmFscGhhID0gb2JqLnZhbHBoYTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSB7XG4gICAgdmFyIHJlc3VsdCA9IGNvbG9yU3RyaW5nLmdldChvYmopO1xuICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIHN0cmluZzogXCIgKyBvYmopO1xuICAgIH1cblxuICAgIHRoaXMubW9kZWwgPSByZXN1bHQubW9kZWw7XG4gICAgY2hhbm5lbHMgPSBjb252ZXJ0W3RoaXMubW9kZWxdLmNoYW5uZWxzO1xuICAgIHRoaXMuY29sb3IgPSByZXN1bHQudmFsdWUuc2xpY2UoMCwgY2hhbm5lbHMpO1xuICAgIHRoaXMudmFscGhhID0gdHlwZW9mIHJlc3VsdC52YWx1ZVtjaGFubmVsc10gPT09IFwibnVtYmVyXCIgPyByZXN1bHQudmFsdWVbY2hhbm5lbHNdIDogMTtcbiAgfSBlbHNlIGlmIChvYmoubGVuZ3RoKSB7XG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsIHx8IFwicmdiXCI7XG4gICAgY2hhbm5lbHMgPSBjb252ZXJ0W3RoaXMubW9kZWxdLmNoYW5uZWxzO1xuICAgIHZhciBuZXdBcnIgPSBfc2xpY2UuY2FsbChvYmosIDAsIGNoYW5uZWxzKTtcbiAgICB0aGlzLmNvbG9yID0gemVyb0FycmF5KG5ld0FyciwgY2hhbm5lbHMpO1xuICAgIHRoaXMudmFscGhhID0gdHlwZW9mIG9ialtjaGFubmVsc10gPT09IFwibnVtYmVyXCIgPyBvYmpbY2hhbm5lbHNdIDogMTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSBcIm51bWJlclwiKSB7XG4gICAgLy8gdGhpcyBpcyBhbHdheXMgUkdCIC0gY2FuIGJlIGNvbnZlcnRlZCBsYXRlciBvbi5cbiAgICBvYmogJj0gMHhmZmZmZmY7XG4gICAgdGhpcy5tb2RlbCA9IFwicmdiXCI7XG4gICAgdGhpcy5jb2xvciA9IFsob2JqID4+IDE2KSAmIDB4ZmYsIChvYmogPj4gOCkgJiAweGZmLCBvYmogJiAweGZmXTtcbiAgICB0aGlzLnZhbHBoYSA9IDE7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy52YWxwaGEgPSAxO1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIGlmIChcImFscGhhXCIgaW4gb2JqKSB7XG4gICAgICBrZXlzLnNwbGljZShrZXlzLmluZGV4T2YoXCJhbHBoYVwiKSwgMSk7XG4gICAgICB0aGlzLnZhbHBoYSA9IHR5cGVvZiBvYmouYWxwaGEgPT09IFwibnVtYmVyXCIgPyBvYmouYWxwaGEgOiAwO1xuICAgIH1cblxuICAgIHZhciBoYXNoZWRLZXlzID0ga2V5cy5zb3J0KCkuam9pbihcIlwiKTtcbiAgICBpZiAoIShoYXNoZWRLZXlzIGluIGhhc2hlZE1vZGVsS2V5cykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIG9iamVjdDogXCIgKyBKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICB9XG5cbiAgICB0aGlzLm1vZGVsID0gaGFzaGVkTW9kZWxLZXlzW2hhc2hlZEtleXNdO1xuXG4gICAgdmFyIGxhYmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0ubGFiZWxzO1xuICAgIHZhciBjb2xvciA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbG9yLnB1c2gob2JqW2xhYmVsc1tpXV0pO1xuICAgIH1cblxuICAgIHRoaXMuY29sb3IgPSB6ZXJvQXJyYXkoY29sb3IpO1xuICB9XG5cbiAgLy8gcGVyZm9ybSBsaW1pdGF0aW9ucyAoY2xhbXBpbmcsIGV0Yy4pXG4gIGlmIChsaW1pdGVyc1t0aGlzLm1vZGVsXSkge1xuICAgIGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2hhbm5lbHM7IGkrKykge1xuICAgICAgdmFyIGxpbWl0ID0gbGltaXRlcnNbdGhpcy5tb2RlbF1baV07XG4gICAgICBpZiAobGltaXQpIHtcbiAgICAgICAgdGhpcy5jb2xvcltpXSA9IGxpbWl0KHRoaXMuY29sb3JbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMudmFscGhhID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdGhpcy52YWxwaGEpKTtcblxuICBpZiAoT2JqZWN0LmZyZWV6ZSkge1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbn1cblxuQ29sb3IucHJvdG90eXBlID0ge1xuICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnN0cmluZygpO1xuICB9LFxuXG4gIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubW9kZWxdKCk7XG4gIH0sXG5cbiAgc3RyaW5nOiBmdW5jdGlvbiAocGxhY2VzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLm1vZGVsIGluIGNvbG9yU3RyaW5nLnRvID8gdGhpcyA6IHRoaXMucmdiKCk7XG4gICAgc2VsZiA9IHNlbGYucm91bmQodHlwZW9mIHBsYWNlcyA9PT0gXCJudW1iZXJcIiA/IHBsYWNlcyA6IDEpO1xuICAgIHZhciBhcmdzID0gc2VsZi52YWxwaGEgPT09IDEgPyBzZWxmLmNvbG9yIDogc2VsZi5jb2xvci5jb25jYXQodGhpcy52YWxwaGEpO1xuICAgIHJldHVybiBjb2xvclN0cmluZy50b1tzZWxmLm1vZGVsXShhcmdzKTtcbiAgfSxcblxuICBwZXJjZW50U3RyaW5nOiBmdW5jdGlvbiAocGxhY2VzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLnJnYigpLnJvdW5kKHR5cGVvZiBwbGFjZXMgPT09IFwibnVtYmVyXCIgPyBwbGFjZXMgOiAxKTtcbiAgICB2YXIgYXJncyA9IHNlbGYudmFscGhhID09PSAxID8gc2VsZi5jb2xvciA6IHNlbGYuY29sb3IuY29uY2F0KHRoaXMudmFscGhhKTtcbiAgICByZXR1cm4gY29sb3JTdHJpbmcudG8ucmdiLnBlcmNlbnQoYXJncyk7XG4gIH0sXG5cbiAgYXJyYXk6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy52YWxwaGEgPT09IDEgPyB0aGlzLmNvbG9yLnNsaWNlKCkgOiB0aGlzLmNvbG9yLmNvbmNhdCh0aGlzLnZhbHBoYSk7XG4gIH0sXG5cbiAgb2JqZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBjaGFubmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0uY2hhbm5lbHM7XG4gICAgdmFyIGxhYmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0ubGFiZWxzO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFubmVsczsgaSsrKSB7XG4gICAgICByZXN1bHRbbGFiZWxzW2ldXSA9IHRoaXMuY29sb3JbaV07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudmFscGhhICE9PSAxKSB7XG4gICAgICByZXN1bHQuYWxwaGEgPSB0aGlzLnZhbHBoYTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIHVuaXRBcnJheTogZnVuY3Rpb24gKCkge1xuICAgIHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuICAgIHJnYlswXSAvPSAyNTU7XG4gICAgcmdiWzFdIC89IDI1NTtcbiAgICByZ2JbMl0gLz0gMjU1O1xuXG4gICAgaWYgKHRoaXMudmFscGhhICE9PSAxKSB7XG4gICAgICByZ2IucHVzaCh0aGlzLnZhbHBoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJnYjtcbiAgfSxcblxuICB1bml0T2JqZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJnYiA9IHRoaXMucmdiKCkub2JqZWN0KCk7XG4gICAgcmdiLnIgLz0gMjU1O1xuICAgIHJnYi5nIC89IDI1NTtcbiAgICByZ2IuYiAvPSAyNTU7XG5cbiAgICBpZiAodGhpcy52YWxwaGEgIT09IDEpIHtcbiAgICAgIHJnYi5hbHBoYSA9IHRoaXMudmFscGhhO1xuICAgIH1cblxuICAgIHJldHVybiByZ2I7XG4gIH0sXG5cbiAgcm91bmQ6IGZ1bmN0aW9uIChwbGFjZXMpIHtcbiAgICBwbGFjZXMgPSBNYXRoLm1heChwbGFjZXMgfHwgMCwgMCk7XG4gICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLmNvbG9yLm1hcChyb3VuZFRvUGxhY2UocGxhY2VzKSkuY29uY2F0KHRoaXMudmFscGhhKSwgdGhpcy5tb2RlbCk7XG4gIH0sXG5cbiAgYWxwaGE6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLmNvbG9yLmNvbmNhdChNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB2YWwpKSksIHRoaXMubW9kZWwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZhbHBoYTtcbiAgfSxcblxuICAvLyByZ2JcbiAgcmVkOiBnZXRzZXQoXCJyZ2JcIiwgMCwgbWF4Zm4oMjU1KSksXG4gIGdyZWVuOiBnZXRzZXQoXCJyZ2JcIiwgMSwgbWF4Zm4oMjU1KSksXG4gIGJsdWU6IGdldHNldChcInJnYlwiLCAyLCBtYXhmbigyNTUpKSxcblxuICBodWU6IGdldHNldChbXCJoc2xcIiwgXCJoc3ZcIiwgXCJoc2xcIiwgXCJod2JcIiwgXCJoY2dcIl0sIDAsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gKCh2YWwgJSAzNjApICsgMzYwKSAlIDM2MDtcbiAgfSksIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYnJhY2Utc3R5bGVcblxuICBzYXR1cmF0aW9ubDogZ2V0c2V0KFwiaHNsXCIsIDEsIG1heGZuKDEwMCkpLFxuICBsaWdodG5lc3M6IGdldHNldChcImhzbFwiLCAyLCBtYXhmbigxMDApKSxcblxuICBzYXR1cmF0aW9udjogZ2V0c2V0KFwiaHN2XCIsIDEsIG1heGZuKDEwMCkpLFxuICB2YWx1ZTogZ2V0c2V0KFwiaHN2XCIsIDIsIG1heGZuKDEwMCkpLFxuXG4gIGNocm9tYTogZ2V0c2V0KFwiaGNnXCIsIDEsIG1heGZuKDEwMCkpLFxuICBncmF5OiBnZXRzZXQoXCJoY2dcIiwgMiwgbWF4Zm4oMTAwKSksXG5cbiAgd2hpdGU6IGdldHNldChcImh3YlwiLCAxLCBtYXhmbigxMDApKSxcbiAgd2JsYWNrOiBnZXRzZXQoXCJod2JcIiwgMiwgbWF4Zm4oMTAwKSksXG5cbiAgY3lhbjogZ2V0c2V0KFwiY215a1wiLCAwLCBtYXhmbigxMDApKSxcbiAgbWFnZW50YTogZ2V0c2V0KFwiY215a1wiLCAxLCBtYXhmbigxMDApKSxcbiAgeWVsbG93OiBnZXRzZXQoXCJjbXlrXCIsIDIsIG1heGZuKDEwMCkpLFxuICBibGFjazogZ2V0c2V0KFwiY215a1wiLCAzLCBtYXhmbigxMDApKSxcblxuICB4OiBnZXRzZXQoXCJ4eXpcIiwgMCwgbWF4Zm4oMTAwKSksXG4gIHk6IGdldHNldChcInh5elwiLCAxLCBtYXhmbigxMDApKSxcbiAgejogZ2V0c2V0KFwieHl6XCIsIDIsIG1heGZuKDEwMCkpLFxuXG4gIGw6IGdldHNldChcImxhYlwiLCAwLCBtYXhmbigxMDApKSxcbiAgYTogZ2V0c2V0KFwibGFiXCIsIDEpLFxuICBiOiBnZXRzZXQoXCJsYWJcIiwgMiksXG5cbiAga2V5d29yZDogZnVuY3Rpb24gKHZhbCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbmV3IENvbG9yKHZhbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnZlcnRbdGhpcy5tb2RlbF0ua2V5d29yZCh0aGlzLmNvbG9yKTtcbiAgfSxcblxuICBoZXg6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG5ldyBDb2xvcih2YWwpO1xuICAgIH1cblxuICAgIHJldHVybiBjb2xvclN0cmluZy50by5oZXgodGhpcy5yZ2IoKS5yb3VuZCgpLmNvbG9yKTtcbiAgfSxcblxuICByZ2JOdW1iZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcbiAgICByZXR1cm4gKChyZ2JbMF0gJiAweGZmKSA8PCAxNikgfCAoKHJnYlsxXSAmIDB4ZmYpIDw8IDgpIHwgKHJnYlsyXSAmIDB4ZmYpO1xuICB9LFxuXG4gIGx1bWlub3NpdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9XQ0FHMjAvI3JlbGF0aXZlbHVtaW5hbmNlZGVmXG4gICAgdmFyIHJnYiA9IHRoaXMucmdiKCkuY29sb3I7XG5cbiAgICB2YXIgbHVtID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjaGFuID0gcmdiW2ldIC8gMjU1O1xuICAgICAgbHVtW2ldID0gY2hhbiA8PSAwLjAzOTI4ID8gY2hhbiAvIDEyLjkyIDogTWF0aC5wb3coKGNoYW4gKyAwLjA1NSkgLyAxLjA1NSwgMi40KTtcbiAgICB9XG5cbiAgICByZXR1cm4gMC4yMTI2ICogbHVtWzBdICsgMC43MTUyICogbHVtWzFdICsgMC4wNzIyICogbHVtWzJdO1xuICB9LFxuXG4gIGNvbnRyYXN0OiBmdW5jdGlvbiAoY29sb3IyKSB7XG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNjb250cmFzdC1yYXRpb2RlZlxuICAgIHZhciBsdW0xID0gdGhpcy5sdW1pbm9zaXR5KCk7XG4gICAgdmFyIGx1bTIgPSBjb2xvcjIubHVtaW5vc2l0eSgpO1xuXG4gICAgaWYgKGx1bTEgPiBsdW0yKSB7XG4gICAgICByZXR1cm4gKGx1bTEgKyAwLjA1KSAvIChsdW0yICsgMC4wNSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChsdW0yICsgMC4wNSkgLyAobHVtMSArIDAuMDUpO1xuICB9LFxuXG4gIGxldmVsOiBmdW5jdGlvbiAoY29sb3IyKSB7XG4gICAgdmFyIGNvbnRyYXN0UmF0aW8gPSB0aGlzLmNvbnRyYXN0KGNvbG9yMik7XG4gICAgaWYgKGNvbnRyYXN0UmF0aW8gPj0gNy4xKSB7XG4gICAgICByZXR1cm4gXCJBQUFcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udHJhc3RSYXRpbyA+PSA0LjUgPyBcIkFBXCIgOiBcIlwiO1xuICB9LFxuXG4gIGlzRGFyazogZnVuY3Rpb24gKCkge1xuICAgIC8vIFlJUSBlcXVhdGlvbiBmcm9tIGh0dHA6Ly8yNHdheXMub3JnLzIwMTAvY2FsY3VsYXRpbmctY29sb3ItY29udHJhc3RcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcbiAgICB2YXIgeWlxID0gKHJnYlswXSAqIDI5OSArIHJnYlsxXSAqIDU4NyArIHJnYlsyXSAqIDExNCkgLyAxMDAwO1xuICAgIHJldHVybiB5aXEgPCAxMjg7XG4gIH0sXG5cbiAgaXNMaWdodDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RhcmsoKTtcbiAgfSxcblxuICBuZWdhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgcmdiLmNvbG9yW2ldID0gMjU1IC0gcmdiLmNvbG9yW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmdiO1xuICB9LFxuXG4gIGxpZ2h0ZW46IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIGhzbC5jb2xvclsyXSArPSBoc2wuY29sb3JbMl0gKiByYXRpbztcbiAgICByZXR1cm4gaHNsO1xuICB9LFxuXG4gIGRhcmtlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG4gICAgdmFyIGhzbCA9IHRoaXMuaHNsKCk7XG4gICAgaHNsLmNvbG9yWzJdIC09IGhzbC5jb2xvclsyXSAqIHJhdGlvO1xuICAgIHJldHVybiBoc2w7XG4gIH0sXG5cbiAgc2F0dXJhdGU6IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIGhzbC5jb2xvclsxXSArPSBoc2wuY29sb3JbMV0gKiByYXRpbztcbiAgICByZXR1cm4gaHNsO1xuICB9LFxuXG4gIGRlc2F0dXJhdGU6IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIGhzbC5jb2xvclsxXSAtPSBoc2wuY29sb3JbMV0gKiByYXRpbztcbiAgICByZXR1cm4gaHNsO1xuICB9LFxuXG4gIHdoaXRlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG4gICAgdmFyIGh3YiA9IHRoaXMuaHdiKCk7XG4gICAgaHdiLmNvbG9yWzFdICs9IGh3Yi5jb2xvclsxXSAqIHJhdGlvO1xuICAgIHJldHVybiBod2I7XG4gIH0sXG5cbiAgYmxhY2tlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG4gICAgdmFyIGh3YiA9IHRoaXMuaHdiKCk7XG4gICAgaHdiLmNvbG9yWzJdICs9IGh3Yi5jb2xvclsyXSAqIHJhdGlvO1xuICAgIHJldHVybiBod2I7XG4gIH0sXG5cbiAgZ3JheXNjYWxlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmF5c2NhbGUjQ29udmVydGluZ19jb2xvcl90b19ncmF5c2NhbGVcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcbiAgICB2YXIgdmFsID0gcmdiWzBdICogMC4zICsgcmdiWzFdICogMC41OSArIHJnYlsyXSAqIDAuMTE7XG4gICAgcmV0dXJuIENvbG9yLnJnYih2YWwsIHZhbCwgdmFsKTtcbiAgfSxcblxuICBmYWRlOiBmdW5jdGlvbiAocmF0aW8pIHtcbiAgICByZXR1cm4gdGhpcy5hbHBoYSh0aGlzLnZhbHBoYSAtIHRoaXMudmFscGhhICogcmF0aW8pO1xuICB9LFxuXG4gIG9wYXF1ZXI6IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHJldHVybiB0aGlzLmFscGhhKHRoaXMudmFscGhhICsgdGhpcy52YWxwaGEgKiByYXRpbyk7XG4gIH0sXG5cbiAgcm90YXRlOiBmdW5jdGlvbiAoZGVncmVlcykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIHZhciBodWUgPSBoc2wuY29sb3JbMF07XG4gICAgaHVlID0gKGh1ZSArIGRlZ3JlZXMpICUgMzYwO1xuICAgIGh1ZSA9IGh1ZSA8IDAgPyAzNjAgKyBodWUgOiBodWU7XG4gICAgaHNsLmNvbG9yWzBdID0gaHVlO1xuICAgIHJldHVybiBoc2w7XG4gIH0sXG5cbiAgbWl4OiBmdW5jdGlvbiAobWl4aW5Db2xvciwgd2VpZ2h0KSB7XG4gICAgLy8gcG9ydGVkIGZyb20gc2FzcyBpbXBsZW1lbnRhdGlvbiBpbiBDXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Nhc3MvbGlic2Fzcy9ibG9iLzBlNmI0YTI4NTAwOTIzNTZhYTNlY2UwN2M2YjI0OWYwMjIxY2FjZWQvZnVuY3Rpb25zLmNwcCNMMjA5XG4gICAgaWYgKCFtaXhpbkNvbG9yIHx8ICFtaXhpbkNvbG9yLnJnYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcmd1bWVudCB0byBcIm1peFwiIHdhcyBub3QgYSBDb2xvciBpbnN0YW5jZSwgYnV0IHJhdGhlciBhbiBpbnN0YW5jZSBvZiAnICsgdHlwZW9mIG1peGluQ29sb3IpO1xuICAgIH1cbiAgICB2YXIgY29sb3IxID0gbWl4aW5Db2xvci5yZ2IoKTtcbiAgICB2YXIgY29sb3IyID0gdGhpcy5yZ2IoKTtcbiAgICB2YXIgcCA9IHdlaWdodCA9PT0gdW5kZWZpbmVkID8gMC41IDogd2VpZ2h0O1xuXG4gICAgdmFyIHcgPSAyICogcCAtIDE7XG4gICAgdmFyIGEgPSBjb2xvcjEuYWxwaGEoKSAtIGNvbG9yMi5hbHBoYSgpO1xuXG4gICAgdmFyIHcxID0gKCh3ICogYSA9PT0gLTEgPyB3IDogKHcgKyBhKSAvICgxICsgdyAqIGEpKSArIDEpIC8gMi4wO1xuICAgIHZhciB3MiA9IDEgLSB3MTtcblxuICAgIHJldHVybiBDb2xvci5yZ2IoXG4gICAgICB3MSAqIGNvbG9yMS5yZWQoKSArIHcyICogY29sb3IyLnJlZCgpLFxuICAgICAgdzEgKiBjb2xvcjEuZ3JlZW4oKSArIHcyICogY29sb3IyLmdyZWVuKCksXG4gICAgICB3MSAqIGNvbG9yMS5ibHVlKCkgKyB3MiAqIGNvbG9yMi5ibHVlKCksXG4gICAgICBjb2xvcjEuYWxwaGEoKSAqIHAgKyBjb2xvcjIuYWxwaGEoKSAqICgxIC0gcClcbiAgICApO1xuICB9LFxufTtcblxuLy8gbW9kZWwgY29udmVyc2lvbiBtZXRob2RzIGFuZCBzdGF0aWMgY29uc3RydWN0b3JzXG5PYmplY3Qua2V5cyhjb252ZXJ0KS5mb3JFYWNoKGZ1bmN0aW9uIChtb2RlbCkge1xuICBpZiAoc2tpcHBlZE1vZGVscy5pbmRleE9mKG1vZGVsKSAhPT0gLTEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY2hhbm5lbHMgPSBjb252ZXJ0W21vZGVsXS5jaGFubmVscztcblxuICAvLyBjb252ZXJzaW9uIG1ldGhvZHNcbiAgQ29sb3IucHJvdG90eXBlW21vZGVsXSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5tb2RlbCA9PT0gbW9kZWwpIHtcbiAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBuZXcgQ29sb3IoYXJndW1lbnRzLCBtb2RlbCk7XG4gICAgfVxuXG4gICAgdmFyIG5ld0FscGhhID0gdHlwZW9mIGFyZ3VtZW50c1tjaGFubmVsc10gPT09IFwibnVtYmVyXCIgPyBjaGFubmVscyA6IHRoaXMudmFscGhhO1xuICAgIHJldHVybiBuZXcgQ29sb3IoYXNzZXJ0QXJyYXkoY29udmVydFt0aGlzLm1vZGVsXVttb2RlbF0ucmF3KHRoaXMuY29sb3IpKS5jb25jYXQobmV3QWxwaGEpLCBtb2RlbCk7XG4gIH07XG5cbiAgLy8gJ3N0YXRpYycgY29uc3RydWN0aW9uIG1ldGhvZHNcbiAgQ29sb3JbbW9kZWxdID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgY29sb3IgPSB6ZXJvQXJyYXkoX3NsaWNlLmNhbGwoYXJndW1lbnRzKSwgY2hhbm5lbHMpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbG9yKGNvbG9yLCBtb2RlbCk7XG4gIH07XG59KTtcblxuZnVuY3Rpb24gcm91bmRUbyhudW0sIHBsYWNlcykge1xuICByZXR1cm4gTnVtYmVyKG51bS50b0ZpeGVkKHBsYWNlcykpO1xufVxuXG5mdW5jdGlvbiByb3VuZFRvUGxhY2UocGxhY2VzKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobnVtKSB7XG4gICAgcmV0dXJuIHJvdW5kVG8obnVtLCBwbGFjZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRzZXQobW9kZWwsIGNoYW5uZWwsIG1vZGlmaWVyKSB7XG4gIG1vZGVsID0gQXJyYXkuaXNBcnJheShtb2RlbCkgPyBtb2RlbCA6IFttb2RlbF07XG5cbiAgbW9kZWwuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgIChsaW1pdGVyc1ttXSB8fCAobGltaXRlcnNbbV0gPSBbXSkpW2NoYW5uZWxdID0gbW9kaWZpZXI7XG4gIH0pO1xuXG4gIG1vZGVsID0gbW9kZWxbMF07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGlmIChtb2RpZmllcikge1xuICAgICAgICB2YWwgPSBtb2RpZmllcih2YWwpO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQgPSB0aGlzW21vZGVsXSgpO1xuICAgICAgcmVzdWx0LmNvbG9yW2NoYW5uZWxdID0gdmFsO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQgPSB0aGlzW21vZGVsXSgpLmNvbG9yW2NoYW5uZWxdO1xuICAgIGlmIChtb2RpZmllcikge1xuICAgICAgcmVzdWx0ID0gbW9kaWZpZXIocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBtYXhmbihtYXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKG1heCwgdikpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhc3NlcnRBcnJheSh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbCA6IFt2YWxdO1xufVxuXG5mdW5jdGlvbiB6ZXJvQXJyYXkoYXJyLCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgYXJyW2ldICE9PSBcIm51bWJlclwiKSB7XG4gICAgICBhcnJbaV0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3I7XG4iLCI8c2NyaXB0PlxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgc2NhbGUgY3NzIHZhcmlhYmxlcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtcIm1lZGl1bVwiIHwgXCJsYXJnZVwifSBbc3BlY3RydW1TY2FsZT1cIm1lZGl1bVwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBzcGVjdHJ1bVNjYWxlID0gXCJtZWRpdW1cIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgdGhlbWUgY3NzIHZhcmlhYmxlcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtcImRhcmtcIiB8IFwiZGFya2VzdFwiIHwgXCJsaWdodFwiIHwgXCJsaWdodGVzdFwifSBbc3BlY3RydW1UaGVtZT1cImxpZ2h0XCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHNwZWN0cnVtVGhlbWUgPSBcImRhcmtcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcmVzZXQgY3NzIHZhcmlhYmxlcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtbe1wiLS1jc3MtdmFyaWFibGUtbmFtZVwiOlwidmFyaWFibGUtdmFsdWVcIn1dIHwgW119IFtyZXNldENzcz0gW11dXG4gICAqL1xuICBleHBvcnQgbGV0IHJlc2V0Q3NzID0gW107XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHJlc2V0IGNzcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtzdHJpbmd9IFtyZXNldENzcz0gW11dXVxuICAgKi9cbiAgZXhwb3J0IGxldCByZXNldENzc1RleHQgPSBcIlwiO1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgdGhlbWUgY29sb3Igb2YgbWF0ZSBlbGVtZW50XG4gICAqIElmIGl0IGlzIG5vdCBzZXQsIHRoZSBwYWdlIHRoZW1lIGNvbG9yIGlzIGF1dG9tYXRpY2FsbHkgb2J0YWluZWRcbiAgICogQHR5cGUge3N0cmluZ30gW3RoZW1lQ29sb3I9IHVuZGVmaW5lZF1dXG4gICAqL1xuICBleHBvcnQgbGV0IHRoZW1lQ29sb3IgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGxhbmd1YWdlIG9mIHBhZ2VcbiAgICogQHR5cGUge3N0cmluZzpJU08gNjM5LTF9IFtsYW5ndWFnZT1cImVuXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGxhbmd1YWdlID0gXCJlblwiO1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGRpciBhdHRyaWJ1dGUgZm9yIGNvbXBvbmVudHMgdG8gcmVuZGVyIGNvcnJlY3RseVxuICAgKiBsdHI6IGxlZnQtdG8tcmlnaHRcbiAgICogcnRsOiByaWdodC10by1sZWZ0XG4gICAqIEB0eXBlIHtcImx0clwiIHwgXCJydGxcIn0gW2xhbmd1YWdlUmVhZGluZ09yZGVyPVwibHRyXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGxhbmd1YWdlUmVhZGluZ09yZGVyID0gXCJsdHJcIjtcblxuICBpbXBvcnQgeyBvbk1vdW50LCBiZWZvcmVVcGRhdGUsIGFmdGVyVXBkYXRlIH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG4gIGxldCB0aGVtZUJnQ29sb3IgPSBcIiNjY2NjY2NcIjtcblxuICBvbk1vdW50KCgpID0+IHtcbiAgICBzZXREb2N1bWVudEVsZW1lbnRQcm9wZXJ0eSgpO1xuICAgIHJlc2V0Q3NzQ29udGVudChyZXNldENzc1RleHQpO1xuICB9KTtcblxuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaW1wb3J0KFwiLi4vdXRpbHMvZm9jdXMtcmluZy1wb2x5ZmlsbFwiKTtcbiAgfSk7XG5cbiAgYmVmb3JlVXBkYXRlKCgpID0+IHtcbiAgICBzZXREb2N1bWVudEVsZW1lbnRQcm9wZXJ0eSgpO1xuICAgIHJlc2V0Q3NzVmFyaWFibGVzKHJlc2V0Q3NzKTtcbiAgICBnZXRUaGVtZUJnQ29sb3IoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2V0RG9jdW1lbnRFbGVtZW50UHJvcGVydHkoKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZSA9IGBzcGVjdHJ1bSBzcGVjdHJ1bS0tJHtzcGVjdHJ1bVNjYWxlfSBzcGVjdHJ1bS0tJHtzcGVjdHJ1bVRoZW1lfWA7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgPSBsYW5ndWFnZTtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZGlyID0gbGFuZ3VhZ2VSZWFkaW5nT3JkZXI7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldENzc1ZhcmlhYmxlcyhhcnJheSkge1xuICAgIGlmICghYXJyYXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNzc1ZhcmlhYmxlc05hbWU7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3NzVmFyaWFibGVzTmFtZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFycmF5W2luZGV4XSk7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoY3NzVmFyaWFibGVzTmFtZSwgYXJyYXlbaW5kZXhdW2Nzc1ZhcmlhYmxlc05hbWVdKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVzZXRDc3NDb250ZW50KGNvbnRlbnRUZXh0KSB7XG4gICAgaWYgKCFjb250ZW50VGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgc2hlZXQuaW5uZXJIVE1MID0gY29udGVudFRleHQ7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzaGVldCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VGhlbWVCZ0NvbG9yKCkge1xuICAgIHRoZW1lQmdDb2xvciA9IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKFxuICAgICAgXCItLXNwZWN0cnVtLWFsaWFzLWJhY2tncm91bmQtY29sb3ItZGVmYXVsdFwiXG4gICAgKTtcbiAgfVxuPC9zY3JpcHQ+XG5cbjxzdmVsdGU6aGVhZD5cbiAgPG1ldGEgbmFtZT1cInRoZW1lLWNvbG9yXCIgY29udGVudD17dGhlbWVDb2xvciB8fCB0aGVtZUJnQ29sb3J9IC8+XG48L3N2ZWx0ZTpoZWFkPlxuPHNsb3QgLz5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBnZXRSZWN0LCBnZXRJblRoZUJveFBvc2l0aW9uIH0gZnJvbSBcIi4uL3V0aWxzL2VsZW1lbnQuanNcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcm9sZSBvZiBtZW51XG4gICAqIEB0eXBlIHtzdHJpbmd9IFtyb2xlID0gXCJtZW51XCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHJvbGUgPSBcIm1lbnVcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbWF4LXdpZHRoIG9mIG1lbnVcbiAgICogQHR5cGUge251bWJlcn0gW21heFdpZHRoID0gMF1cbiAgICovXG4gIGV4cG9ydCBsZXQgbWF4V2lkdGggPSAwO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBtaW4td2lkdGggb2YgbWVudVxuICAgKiBAdHlwZSB7bnVtYmVyfSBbbWluV2lkdGggPSAwXVxuICAgKi9cbiAgZXhwb3J0IGxldCBtaW5XaWR0aCA9IDA7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGFyaWEtbGFiZWxsZWRieSBvZiBtZW51XG4gICAqIEB0eXBlIHtzdHJpbmd9IFthcmlhTGFiZWxsZWRieSA9IFwiXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGFyaWFMYWJlbGxlZGJ5ID0gXCJcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbmVzdGVkIG1vZGUgb2YgbWVudVxuICAgKiBAdHlwZSB7Ym9vbGVhbn0gW25lc3RlZCA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBuZXN0ZWQgPSBmYWxzZTtcblxuICBsZXQgbWVudUVsO1xuICBsZXQgbWVudVdpZHRoO1xuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaWYgKG1lbnVFbCkge1xuICAgICAgbmVzdGVkICYmIHJlc2V0UG9zaXRpb24oKTtcbiAgICAgIG1lbnVXaWR0aCA9IHNldFdpZHRoKCkud2lkdGg7XG4gICAgfVxuICB9KTtcbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgbmVzdGVkICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbGlzdGVuRm9yQ2hpbGRDbGlja3MpO1xuICB9KTtcblxuICBmdW5jdGlvbiBsaXN0ZW5Gb3JDaGlsZENsaWNrcyhlKSB7XG4gICAgbGV0IHByZXZOb2RlID0gbWVudUVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgaWYgKHByZXZOb2RlICYmIHByZXZOb2RlLmNvbnRhaW5zKGUudGFyZ2V0KSkge1xuICAgICAgbWVudUVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgJiYgcmVzZXRQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBnZXRJblRoZUJveFBvc2l0aW9uVG9wID0gMDtcbiAgbGV0IGdldEluVGhlQm94UG9zaXRpb25MZWZ0ID0gMDtcbiAgZnVuY3Rpb24gcmVzZXRQb3NpdGlvbigpIHtcbiAgICBsZXQgcHJldk5vZGUgPSBtZW51RWwucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBpZiAocHJldk5vZGUpIHtcbiAgICAgIGxldCBvcGVuSXRlbSA9IHByZXZOb2RlLnF1ZXJ5U2VsZWN0b3IoXCIuc3BlY3RydW0tTWVudS1pdGVtLmlzLW9wZW5cIik7XG4gICAgICBnZXRJblRoZUJveFBvc2l0aW9uTGVmdCA9IGdldFJlY3QocHJldk5vZGUpLndpZHRoO1xuICAgICAgWywgZ2V0SW5UaGVCb3hQb3NpdGlvblRvcF0gPSBnZXRJblRoZUJveFBvc2l0aW9uKHByZXZOb2RlLCBvcGVuSXRlbSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldFdpZHRoKCkge1xuICAgIGxldCB0aGlzTWVudSA9IG1lbnVFbC5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiNydWJ1cy1BY3Rpb25Tb3VyY2VcIik7XG4gICAgaWYgKHRoaXNNZW51KSB7XG4gICAgICByZXR1cm4gZ2V0UmVjdCh0aGlzTWVudSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IHdpZHRoOiAwIH07XG4gICAgfVxuICB9XG5cbiAgJDogc3R5bGVDc3NUZXh0ID0gW1xuICAgIG1heFdpZHRoID8gYG1heC13aWR0aDoke21heFdpZHRofXB4O2AgOiBgbWF4LXdpZHRoOiR7bWVudVdpZHRofXB4O2AsXG4gICAgbWluV2lkdGggPyBgbWluLXdpZHRoOiR7bWluV2lkdGh9cHg7YCA6IGBtaW4td2lkdGg6JHttZW51V2lkdGh9cHg7YCxcbiAgICBuZXN0ZWQgJiYgYHRvcDoke2dldEluVGhlQm94UG9zaXRpb25Ub3B9cHg7YCxcbiAgICBuZXN0ZWQgJiYgYGxlZnQ6JHtnZXRJblRoZUJveFBvc2l0aW9uTGVmdH1weDtgLFxuICBdXG4gICAgLmZpbHRlcihCb29sZWFuKVxuICAgIC5qb2luKFwiIFwiKTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgZ2xvYmFsPlxuICAuc3BlY3RydW0tTWVudS1pdGVtTGFiZWwge1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgd2lkdGg6IGF1dG87XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICpkaXNwbGF5OiBpbmxpbmU7XG4gIH1cbiAgLnNwZWN0cnVtLU1lbnUge1xuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcbiAgfVxuICAuc3BlY3RydW0tTWVudS1uZXN0ZWQge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgfVxuPC9zdHlsZT5cblxuPHVsXG4gIGNsYXNzPVwic3BlY3RydW0tTWVudVwiXG4gIGNsYXNzOnNwZWN0cnVtLU1lbnUtbmVzdGVkPXtuZXN0ZWR9XG4gIHtyb2xlfVxuICBzdHlsZT17c3R5bGVDc3NUZXh0fVxuICBiaW5kOnRoaXM9e21lbnVFbH1cbiAgYXJpYS1sYWJlbGxlZGJ5PXthcmlhTGFiZWxsZWRieX0+XG4gIDxzbG90IC8+XG48L3VsPlxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0IHsgY3VycmVudF9jb21wb25lbnQgfSBmcm9tIFwic3ZlbHRlL2ludGVybmFsXCI7XG4gIGltcG9ydCB7IGdldEV2ZW50c0FjdGlvbiB9IGZyb20gXCIuLi91dGlscy9nZXQtZXZlbnRzLWFjdGlvbi5qc1wiO1xuICBpbXBvcnQgeyBJY29uQ2hlY2ttYXJrTWVkaXVtLCBJY29uQ2hldnJvblJpZ2h0TWVkaXVtIH0gZnJvbSBcIkBydWJ1cy9zdmVsdGUtc3BlY3RydW0taWNvbnMtdWlcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbGFiZWwgb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7c3RyaW5nfSBbbGFiZWwgPSBcIlwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBsYWJlbCA9IFwiXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHNlbGVjdGVkIHN0YXR1cyBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtib29sZWFufSBbaXNTZWxlY3RlZCA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc1NlbGVjdGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldCB0byBgdHJ1ZWAgdG8gZGlzYWJsZSB0aGUgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtib29sZWFufVtkaXNhYmxlZD1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZGl2aWRlciBzdGF0dXMgb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7Ym9vbGVhbn0gW2lzRGl2aWRlciA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc0RpdmlkZXIgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZmluYWxseSByZXN1bHQgaW5kZXggb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7bnVtYmVyfSBbcmVzdWx0SW5kZXggPSAwXVxuICAgKi9cbiAgZXhwb3J0IGxldCByZXN1bHRJbmRleCA9IDA7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHRoaXMgaXRlbSBpbmRleCBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtudW1iZXJ9IFt0aGlzSW5kZXggPSAwXVxuICAgKi9cbiAgZXhwb3J0IGxldCB0aGlzSW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSB0YWJpbmRleCBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtudW1iZXJ9IFt0YWJpbmRleCA9IDBdXG4gICAqL1xuICBleHBvcnQgbGV0IHRhYmluZGV4ID0gMDtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcm9sZSBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtzdHJpbmd9IFtyb2xlID0gXCJtZW51aXRlbVwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCByb2xlID0gXCJtZW51aXRlbVwiO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGRpc3BsYXkgQ2hlY2ttYXJrIGljb25cbiAgICogQHR5cGUge251bWJlcn0gW3Nob3dDaGVja21hcmsgPSB0cnVlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBzaG93Q2hlY2ttYXJrID0gdHJ1ZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbmVzdGVkIG1vZGUgb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7Ym9vbGVhbn0gW25lc3RlZCA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBuZXN0ZWQgPSBmYWxzZTtcblxuICBjb25zdCBldmVudHNMaXN0ZW4gPSBnZXRFdmVudHNBY3Rpb24oY3VycmVudF9jb21wb25lbnQpO1xuICBmdW5jdGlvbiBkcm9wZG93blBpY2soKSB7XG4gICAgcmVzdWx0SW5kZXggPSB0aGlzSW5kZXg7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGUgZ2xvYmFsPlxuICAuc3BlY3RydW0tTWVudS1pdGVtIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgfVxuICAuc3BlY3RydW0tTWVudS1pdGVtSWNvbiB7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuXG4gICAgcmlnaHQ6IDA7XG4gIH1cbiAgLnNwZWN0cnVtLU1lbnUtaXRlbS5pcy1kaXNhYmxlZCB7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIH1cbjwvc3R5bGU+XG5cbnsjaWYgaXNEaXZpZGVyfVxuICA8bGkgY2xhc3M9XCJzcGVjdHJ1bS1NZW51LWRpdmlkZXJcIiByb2xlPVwic2VwYXJhdG9yXCIgLz5cbns6ZWxzZX1cbiAgPGxpXG4gICAgY2xhc3M9XCJzcGVjdHJ1bS1NZW51LWl0ZW1cIlxuICAgIGNsYXNzOmlzLXNlbGVjdGVkPXshbmVzdGVkICYmIChpc1NlbGVjdGVkIHx8IHJlc3VsdEluZGV4ID09PSB0aGlzSW5kZXgpfVxuICAgIGNsYXNzOmlzLWRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICBjbGFzczppcy1vcGVuPXtuZXN0ZWQgJiYgKGlzU2VsZWN0ZWQgfHwgcmVzdWx0SW5kZXggPT09IHRoaXNJbmRleCl9XG4gICAge3JvbGV9XG4gICAge3RhYmluZGV4fVxuICAgIG9uOmNsaWNrPXshZGlzYWJsZWQgJiYgZHJvcGRvd25QaWNrfVxuICAgIHVzZTpldmVudHNMaXN0ZW4+XG4gICAgPHNsb3Q+PHNwYW4gY2xhc3M9XCJzcGVjdHJ1bS1NZW51LWl0ZW1MYWJlbFwiPntsYWJlbH08L3NwYW4+PC9zbG90PlxuICAgIHsjaWYgbmVzdGVkICYmIChpc1NlbGVjdGVkIHx8IHJlc3VsdEluZGV4ID09PSB0aGlzSW5kZXgpfVxuICAgICAgPEljb25DaGV2cm9uUmlnaHRNZWRpdW1cbiAgICAgICAgY2xhc3NOYW1lPVwic3BlY3RydW0tVUlJY29uLUNoZXZyb25SaWdodE1lZGl1bSBzcGVjdHJ1bS1NZW51LWNoZXZyb24gc3BlY3RydW0tTWVudS1pdGVtSWNvblwiXG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgd2lkdGg9XCI2XCJcbiAgICAgICAgaGVpZ2h0PVwiMTBcIlxuICAgICAgICBhcmlhLWhpZGRlbj17aXNTZWxlY3RlZH1cbiAgICAgICAgYXJpYS1sYWJlbD1cIk5leHRcIiAvPlxuICAgIHs6ZWxzZSBpZiBzaG93Q2hlY2ttYXJrfVxuICAgICAgPEljb25DaGVja21hcmtNZWRpdW1cbiAgICAgICAgY2xhc3NOYW1lPVwic3BlY3RydW0tTWVudS1jaGVja21hcmsgc3BlY3RydW0tTWVudS1pdGVtSWNvblwiXG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgd2lkdGg9XCIxMlwiXG4gICAgICAgIGhlaWdodD1cIjEyXCJcbiAgICAgICAgYXJpYS1oaWRkZW49e2lzU2VsZWN0ZWR9IC8+XG4gICAgey9pZn1cbiAgPC9saT5cbnsvaWZ9XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBJY29uQ2hldnJvbkRvd25NZWRpdW0sIEljb25BbGVydE1lZGl1bSB9IGZyb20gXCJAcnVidXMvc3ZlbHRlLXNwZWN0cnVtLWljb25zLXVpXCI7XG4gIGltcG9ydCB7IFBvcG92ZXIgfSBmcm9tIFwiLi4vUG9wb3ZlclwiO1xuICBpbXBvcnQgeyBNZW51IH0gZnJvbSBcIi4uL01lbnVcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcGxhY2Vob2xkZXIgb2YgZHJvcGRvd25cbiAgICogQHR5cGUge3N0cmluZ30gW3BsYWNlaG9sZGVyID0gXCJcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgcGxhY2Vob2xkZXIgPSBcIlwiO1xuXG4gIC8qKlxuICAgKiBTZXQgdG8gYHRydWVgIHRvIGRpc2FibGUgdGhlIGRyb3Bkb3duXG4gICAqIEB0eXBlIHtib29sZWFufVtkaXNhYmxlZD1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgZHJvcGRvd24gaXMgb3BlblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1baXNPcGVuPWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc09wZW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogU2V0IGl0cyBleHRlcm5hbCByZXN1bHQgaW5kZXhcbiAgICogQHR5cGUgeyBudW1iZXIgfSBbcmVzdWx0SW5kZXggPSAwXG4gICAqL1xuICBleHBvcnQgbGV0IHJlc3VsdEluZGV4ID0gMDtcblxuICAvKipcbiAgICogU2V0IGl0cyBjdXJyZW50IGluZGV4XG4gICAqIEB0eXBlIHsgbnVtYmVyIH0gW3RoaXNJbmRleCA9IDBcbiAgICovXG4gIGV4cG9ydCBsZXQgdGhpc0luZGV4ID0gMDtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgaW52YWxpZCBtb2RlIG9mIGRyb3Bkb3duXG4gICAqIEB0eXBlIHsgYm9vbGVhbiB9IFtpc0ludmFsaWQ9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc0ludmFsaWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcXVpZXQgbW9kZSBvZiBkcm9wZG93blxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNRdWlldD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzUXVpZXQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgY3NzIGBtaW4td2lkdGhgIG9mIGRyb3Bkb3duIGFuZCBjaGlsZCBtZW51XG4gICAqIEB0eXBlIHsgbnVtYmVyIH0gW21pbldpZHRoID0gXCIyMDBcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgbWluV2lkdGggPSAyMDA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gYXV0b21hdGljYWxseSBmb2xkXG4gICAqIEB0eXBlIHtib29sZWFufVthdXRvRm9sZD1mYWxzZV1cbiAgICovXG5cbiAgZXhwb3J0IGxldCBhdXRvRm9sZCA9IHRydWU7XG5cbiAgbGV0IGlzQWN0aXZlID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRyb3Bkb3duU3RhdHVzQ3V0b3ZlcigpIHtcbiAgICBpc0FjdGl2ZSA9IHRydWU7XG4gICAgcmVzdWx0SW5kZXggPSB0aGlzSW5kZXg7XG4gICAgaXNPcGVuID0gIWlzT3BlbjtcbiAgfVxuICBvbk1vdW50KCgpID0+IHtcbiAgICBkcm9wbWVudUVsICYmIGRyb3BtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGxpc3RlbkZvckNoaWxkQ2xpY2tzKTtcbiAgICBkcm9wbWVudUVsICYmIGRyb3BtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGxpc3RlbkZvckNoaWxkQ2xpY2tzKTtcbiAgICB3aW5kb3cgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsaXN0ZW5Gb3JPdGhlckNsaWNrcyk7XG4gICAgd2luZG93ICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgbGlzdGVuRm9yT3RoZXJDbGlja3MpO1xuICB9KTtcblxuICBsZXQgZHJvcG1lbnVFbDtcbiAgbGV0IHRyaWdnZXJOb2RlID0gXCJcIjtcbiAgZnVuY3Rpb24gbGlzdGVuRm9yQ2hpbGRDbGlja3MoZSkge1xuICAgIGlmIChkcm9wbWVudUVsICYmIGRyb3BtZW51RWwuY29udGFpbnMoZS50YXJnZXQpKSB7XG4gICAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0Lmxlbmd0aCkge1xuICAgICAgICBpZiAodGVzdEhhc0NsYXNzTmFtZShlLnRhcmdldC5jbGFzc0xpc3QsIGBzcGVjdHJ1bS1NZW51LWl0ZW1gKSkge1xuICAgICAgICAgIHRyaWdnZXJOb2RlID0gZ2V0Tm9kZUhUTUwoZS50YXJnZXQuY2hpbGROb2Rlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVzdEhhc0NsYXNzTmFtZShlLnRhcmdldC5jbGFzc0xpc3QsIGBzcGVjdHJ1bS1NZW51LWl0ZW1MYWJlbGApKSB7XG4gICAgICAgICAgdHJpZ2dlck5vZGUgPSBnZXROb2RlSFRNTChlLnRhcmdldC5wYXJlbnROb2RlLmNoaWxkTm9kZXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHRlc3RIYXNDbGFzc05hbWUoZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc0xpc3QsIGBzcGVjdHJ1bS1NZW51LWl0ZW1gKSkge1xuICAgICAgICAgIHRyaWdnZXJOb2RlID0gZ2V0Tm9kZUhUTUwoZS50YXJnZXQucGFyZW50Tm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBsaXN0ZW5Gb3JPdGhlckNsaWNrcyhlKSB7XG4gICAgaWYgKCFhdXRvRm9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZHJvcG1lbnVFbCAmJiAhZHJvcG1lbnVFbC5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgIGlzT3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRlc3RIYXNDbGFzc05hbWUoZWwsIHZlcmlmeVN0cmluZykge1xuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGVsLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmV0dXJuIGVsW2luZGV4XSA9PT0gdmVyaWZ5U3RyaW5nO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBnZXROb2RlSFRNTChlbCkge1xuICAgIGlmICghZWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgbGV0IG5vZGVIVE1MID0gXCJcIjtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWwubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBpZiAoIXRlc3RIYXNDbGFzc05hbWUoZWxbaW5kZXhdLmNsYXNzTGlzdCwgYHNwZWN0cnVtLU1lbnUtY2hlY2ttYXJrYCkpIHtcbiAgICAgICAgZWxbaW5kZXhdLm91dGVySFRNTCA/IChub2RlSFRNTCA9IG5vZGVIVE1MICsgZWxbaW5kZXhdLm91dGVySFRNTCkgOiBub2RlSFRNTDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVIVE1MLnJlcGxhY2UoL3NwZWN0cnVtLU1lbnUtaXRlbUxhYmVsL2csIFwic3BlY3RydW0tRHJvcGRvd24tbGFiZWxcIik7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGUgZ2xvYmFsPlxuICAuc3BlY3RydW0tRmllbGRCdXR0b24ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gIH1cbiAgLnNwZWN0cnVtLURyb3Bkb3duLXRyaWdnZXIgPiAuc3BlY3RydW0tRHJvcGRvd24taWNvbiB7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1hbmltYXRpb24tZHVyYXRpb24tMTAwLCAxMzBtcykgZWFzZS1pbi1vdXQsXG4gICAgICBvcGFjaXR5IHZhcigtLXNwZWN0cnVtLWdsb2JhbC1hbmltYXRpb24tZHVyYXRpb24tMTAwLCAxMzBtcykgZWFzZS1pbi1vdXQsXG4gICAgICB2aXNpYmlsaXR5IDBtcyBsaW5lYXIgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWFuaW1hdGlvbi1kdXJhdGlvbi0xMDAsIDEzMG1zKTtcbiAgfVxuICAuc3BlY3RydW0tRHJvcGRvd24tdHJpZ2dlci5pcy1zZWxlY3RlZCA+IC5zcGVjdHJ1bS1Ecm9wZG93bi1pY29uIHtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpO1xuICB9XG48L3N0eWxlPlxuXG48ZGl2XG4gIGNsYXNzPVwic3BlY3RydW0tRHJvcGRvd25cIlxuICBjbGFzczppcy1vcGVuPXtpc09wZW59XG4gIGNsYXNzOmlzLWludmFsaWQ9e2lzSW52YWxpZH1cbiAgY2xhc3M6aXMtZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICBjbGFzczpzcGVjdHJ1bS1Ecm9wZG93bi0tcXVpZXQ9e2lzUXVpZXR9XG4gIG9uOmNsaWNrPXshZGlzYWJsZWQgJiYgZHJvcGRvd25TdGF0dXNDdXRvdmVyfVxuICBiaW5kOnRoaXM9e2Ryb3BtZW51RWx9PlxuICA8YnV0dG9uXG4gICAgY2xhc3M9XCJzcGVjdHJ1bS1GaWVsZEJ1dHRvbiBzcGVjdHJ1bS1Ecm9wZG93bi10cmlnZ2VyXCJcbiAgICBjbGFzczppcy1zZWxlY3RlZD17aXNPcGVufVxuICAgIGNsYXNzOmlzLWludmFsaWQ9e2lzSW52YWxpZH1cbiAgICBjbGFzczppcy1kaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgY2xhc3M6c3BlY3RydW0tRmllbGRCdXR0b24tLXF1aWV0PXtpc1F1aWV0fVxuICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICBpZD1cInJ1YnVzLUFjdGlvblNvdXJjZVwiXG4gICAgc3R5bGU9XCJtaW4td2lkdGg6e21pbldpZHRofXB4XCI+XG4gICAgeyNpZiAhdHJpZ2dlck5vZGV9XG4gICAgICA8c3BhbiBjbGFzcz1cInNwZWN0cnVtLURyb3Bkb3duLWxhYmVsXCIgY2xhc3M6aXMtcGxhY2Vob2xkZXI9eyFpc0FjdGl2ZSAmJiBwbGFjZWhvbGRlcn0+XG4gICAgICAgIDxzbG90IG5hbWU9XCJkcm9wZG93bi1sYWJlbFwiPntwbGFjZWhvbGRlcn08L3Nsb3Q+XG4gICAgICA8L3NwYW4+XG4gICAgezplbHNlfVxuICAgICAge0BodG1sIHRyaWdnZXJOb2RlfVxuICAgIHsvaWZ9XG4gICAgeyNpZiBpc0ludmFsaWR9XG4gICAgICA8SWNvbkFsZXJ0TWVkaXVtIGZvY3VzYWJsZT1cImZhbHNlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgYXJpYS1sYWJlbD1cIkZvbGRlclwiIC8+XG4gICAgey9pZn1cbiAgICA8SWNvbkNoZXZyb25Eb3duTWVkaXVtIGNsYXNzTmFtZT1cInNwZWN0cnVtLURyb3Bkb3duLWljb25cIiBmb2N1c2FibGU9XCJmYWxzZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gIDwvYnV0dG9uPlxuXG4gIDxQb3BvdmVyIGNsYXNzPVwic3BlY3RydW0tRHJvcGRvd24tcG9wb3ZlclwiIHtpc09wZW59PlxuICAgIDxNZW51IHJvbGU9XCJsaXN0Ym94XCIge21pbldpZHRofT5cbiAgICAgIDxzbG90IC8+XG4gICAgPC9NZW51PlxuICA8L1BvcG92ZXI+XG4gIDxkaXYgLz5cbjwvZGl2PlxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0ICogYXMgcm91dGVyIGZyb20gXCIuL25hdi5qc29uXCI7XG4gIGltcG9ydCB7IEJ1dHRvbiwgQWN0aW9uR3JvdXAgfSBmcm9tIFwiQHJ1YnVzL3J1YnVzL3NyY1wiO1xuICBpbXBvcnQgeyBEcm9wZG93biB9IGZyb20gXCJAcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL0Ryb3Bkb3duXCI7XG4gIGltcG9ydCB7IE1lbnVJdGVtIH0gZnJvbSBcIkBydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvTWVudVwiO1xuICBpbXBvcnQgeyBhZnRlclVwZGF0ZSwgYmVmb3JlVXBkYXRlLCBnZXRDb250ZXh0LCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG4gIGV4cG9ydCBsZXQgc2VnbWVudCA9IFwiXCI7XG5cbiAgbGV0IHJ1YnVzRG9jQ29uZmlnID0gZ2V0Q29udGV4dChcInJ1YnVzRG9jQ29uZmlnXCIpO1xuICBsZXQgdGhlbWVMaXN0ID0gW1wibGlnaHRcIiwgXCJsaWdodGVzdFwiLCBcImRhcmtcIiwgXCJkYXJrZXN0XCJdO1xuICBsZXQgbGFuZ3VhZ2VMaXN0ID0gW1xuICAgIHsgbmFtZTogXCLkuK3mlodcIiwgY29kZTogXCJ6aFwiIH0sXG4gICAgeyBuYW1lOiBcIkVuZ2xpc2hcIiwgY29kZTogXCJlblwiIH0sXG4gIF07XG5cbiAgbGV0IHJlc3VsdExhbmd1YWdlSW5kZXggPSAwO1xuICBsZXQgcmVzdWx0VGhlbWVJbmRleCA9IDA7XG5cbiAgZnVuY3Rpb24gc3dpdGNoVGhlbWUodCkge1xuICAgICRydWJ1c0RvY0NvbmZpZy50aGVtZSA9IHQ7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwicnVidXMtbG9jYWwtY29uZmlnLXRoZW1lXCIsIHQpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3dpdGNoTGFuZ3VhZ2UobCkge1xuICAgICRydWJ1c0RvY0NvbmZpZy5sYW5nID0gbDtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJydWJ1cy1sb2NhbC1jb25maWctbGFuZ1wiLCBsKTtcbiAgfVxuXG4gIGJlZm9yZVVwZGF0ZSgoKSA9PiB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoZW1lTGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGlmICh0aGVtZUxpc3RbaW5kZXhdID09PSAkcnVidXNEb2NDb25maWcudGhlbWUpIHtcbiAgICAgICAgcmVzdWx0VGhlbWVJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGFuZ3VhZ2VMaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgaWYgKGxhbmd1YWdlTGlzdFtpbmRleF0uY29kZSA9PT0gJHJ1YnVzRG9jQ29uZmlnLmxhbmcpIHtcbiAgICAgICAgcmVzdWx0TGFuZ3VhZ2VJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICBuYXYge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICB3aWR0aDogMTAwdnc7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWNvbG9yLWdyYXktNTApO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgei1pbmRleDogMjAwO1xuICAgIGJvcmRlci1ib3R0b206IDFweCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtY29sb3ItZ3JheS04MCk7XG4gIH1cbiAgdWwge1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAwO1xuICB9XG4gIGxpIHtcbiAgICBsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XG4gIH1cbiAgYSxcbiAgYTpob3ZlcixcbiAgYTpmb2N1cyxcbiAgYTphY3RpdmUge1xuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgfVxuICAubmF2LXdyYXAge1xuICAgIHdpZHRoOiA5OCU7XG4gICAgaGVpZ2h0OiA2MHB4O1xuXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIH1cbiAgLm5hdi1pdGVtIHtcbiAgICBoZWlnaHQ6IDYwcHg7XG4gIH1cbiAgLm5hdi1sb2dvIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIH1cblxuICBpbWcge1xuICAgIGhlaWdodDogNDBweDtcbiAgfVxuXG4gIC5yb3V0ZXItd3JhcCB7XG4gICAgaGVpZ2h0OiA2MHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIH1cbiAgLnJvdXRlLWl0ZW0ge1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcblxuICAgIHdpZHRoOiAxMjBweDtcbiAgICBsaW5lLWhlaWdodDogNjBweDtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB9XG4gIC5jdXJyZW50LXJvdXRlIHtcbiAgICBjb2xvcjogdmFyKC0tc3BlY3RydW0tc2VtYW50aWMtY3RhLWNvbG9yLWJhY2tncm91bmQtZGVmYXVsdCk7XG4gIH1cblxuICBzcGFuIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLXNwZWN0cnVtLXNlbWFudGljLWN0YS1jb2xvci1iYWNrZ3JvdW5kLWRlZmF1bHQpO1xuICAgIGxlZnQ6IDQ1cHg7XG4gICAgd2lkdGg6IDMwcHg7XG4gICAgaGVpZ2h0OiA0LjVweDtcbiAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiA0LjVweDtcbiAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogNC41cHg7XG4gIH1cbiAgLm5hdi1tZW51LWFyZWEge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICB9XG4gIC50aGVtZS1saXN0IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgaGVpZ2h0OiA2MHB4O1xuICB9XG4gIC5sYW5ndWFnZS1saXN0IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIHdpZHRoOiAxNDBweDtcbiAgICBoZWlnaHQ6IDYwcHg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICB9XG48L3N0eWxlPlxuXG48bmF2PlxuICA8dWwgY2xhc3M9XCJuYXYtd3JhcFwiPlxuICAgIDxsaSBjbGFzcz1cIm5hdi1pdGVtIG5hdi1sb2dvXCI+XG4gICAgICA8YSBocmVmPVwiLi9cIj5cbiAgICAgICAgPGltZ1xuICAgICAgICAgIHNyYz1cImxvZ28teyRydWJ1c0RvY0NvbmZpZy50aGVtZSA9PSAnbGlnaHQnIHx8ICRydWJ1c0RvY0NvbmZpZy50aGVtZSA9PSAnbGlnaHRlc3QnID8gJ2xpZ2h0JyA6ICdkYXJrJ30ucG5nXCJcbiAgICAgICAgICBhbHQ9XCJsb2dvXCIgLz5cbiAgICAgIDwvYT5cbiAgICA8L2xpPlxuICAgIDxsaSBjbGFzcz1cIm5hdi1pdGVtXCI+XG4gICAgICA8dWwgY2xhc3M9XCJyb3V0ZXItd3JhcFwiPlxuICAgICAgICB7I2VhY2ggcm91dGVyWyRydWJ1c0RvY0NvbmZpZy5sYW5nXSBhcyByb3V0ZSwgaX1cbiAgICAgICAgICA8bGlcbiAgICAgICAgICAgIGNsYXNzPVwicm91dGUtaXRlbVwiXG4gICAgICAgICAgICBjbGFzczpjdXJyZW50LXJvdXRlPXtyb3V0ZS51cmwucmVwbGFjZSgnLi8nLCAnJykgPT09IHNlZ21lbnQgfHwgKHJvdXRlLnVybCA9PT0gJy4vJyAmJiAhc2VnbWVudCAmJiBpID09IDApfT5cbiAgICAgICAgICAgIDxhIGhyZWY9e3JvdXRlLnVybH0+e3JvdXRlLm5hbWV9XG4gICAgICAgICAgICAgIHsjaWYgcm91dGUudXJsLnJlcGxhY2UoJy4vJywgJycpID09PSBzZWdtZW50IHx8IChyb3V0ZS51cmwgPT09ICcuLycgJiYgIXNlZ21lbnQgJiYgaSA9PSAwKX1cbiAgICAgICAgICAgICAgICA8c3BhbiAvPlxuICAgICAgICAgICAgICB7L2lmfTwvYT5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICB7L2VhY2h9XG4gICAgICA8L3VsPlxuICAgIDwvbGk+XG4gICAgPGxpIGNsYXNzPVwibmF2LWl0ZW0gbmF2LW1lbnUtYXJlYVwiPlxuICAgICAgPGRpdiBjbGFzcz1cInRoZW1lLWxpc3RcIj5cbiAgICAgICAgPERyb3Bkb3duXG4gICAgICAgICAgcGxhY2Vob2xkZXI9eyRydWJ1c0RvY0NvbmZpZy50aGVtZS5yZXBsYWNlKC9eXFxTLywgKHMpID0+IHMudG9VcHBlckNhc2UoKSl9XG4gICAgICAgICAgaXNRdWlldFxuICAgICAgICAgIG1pbldpZHRoPVwiODBcIlxuICAgICAgICAgIHJlc3VsdEluZGV4PXtyZXN1bHRUaGVtZUluZGV4fT5cbiAgICAgICAgICB7I2VhY2ggdGhlbWVMaXN0IGFzIGl0ZW0sIGluZGV4fVxuICAgICAgICAgICAgPE1lbnVJdGVtXG4gICAgICAgICAgICAgIHRoaXNJbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgIGxhYmVsPXtpdGVtLnJlcGxhY2UoL15cXFMvLCAocykgPT4gcy50b1VwcGVyQ2FzZSgpKX1cbiAgICAgICAgICAgICAgcmVzdWx0SW5kZXg9e3Jlc3VsdFRoZW1lSW5kZXh9XG4gICAgICAgICAgICAgIG9uOmNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoVGhlbWUoaXRlbSk7XG4gICAgICAgICAgICAgIH19IC8+XG4gICAgICAgICAgey9lYWNofVxuICAgICAgICA8L0Ryb3Bkb3duPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwibGFuZ3VhZ2UtbGlzdFwiPlxuICAgICAgICA8RHJvcGRvd24gcGxhY2Vob2xkZXI9XCJMYW5ndWFnZVwiIGlzUXVpZXQgbWluV2lkdGg9XCI4MFwiIHJlc3VsdEluZGV4PXtyZXN1bHRMYW5ndWFnZUluZGV4fT5cbiAgICAgICAgICB7I2VhY2ggbGFuZ3VhZ2VMaXN0IGFzIGxhbmcsIGl9XG4gICAgICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICAgICAgdGhpc0luZGV4PXtpfVxuICAgICAgICAgICAgICBsYWJlbD17bGFuZy5uYW1lfVxuICAgICAgICAgICAgICByZXN1bHRJbmRleD17cmVzdWx0TGFuZ3VhZ2VJbmRleH1cbiAgICAgICAgICAgICAgaXNTZWxlY3RlZD17aSA9PT0gcmVzdWx0TGFuZ3VhZ2VJbmRleH1cbiAgICAgICAgICAgICAgb246Y2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzd2l0Y2hMYW5ndWFnZShsYW5nLmNvZGUpO1xuICAgICAgICAgICAgICB9fSAvPlxuICAgICAgICAgIHsvZWFjaH1cbiAgICAgICAgPC9Ecm9wZG93bj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gIDwvdWw+XG48L25hdj5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IENvcm5lcnN0b25lIH0gZnJvbSBcIkBydWJ1cy9ydWJ1cy9zcmNcIjtcbiAgaW1wb3J0IHsgc2V0Q29udGV4dCwgZ2V0Q29udGV4dCwgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCI7XG4gIGltcG9ydCB7IE5hdiB9IGZyb20gXCIuLi9jb21wb25lbnRzXCI7XG4gIGV4cG9ydCBsZXQgc2VnbWVudDtcblxuICBjb25zdCBydWJ1c0RvY0NvbmZpZyA9IHdyaXRhYmxlKHtcbiAgICBsYW5nOiBcInpoXCIsXG4gICAgdGhlbWU6IFwibGlnaHRcIixcbiAgfSk7XG4gIHNldENvbnRleHQoXCJydWJ1c0RvY0NvbmZpZ1wiLCBydWJ1c0RvY0NvbmZpZyk7XG4gIGxldCBfcnVidXNEb2NDb25maWcgPSBnZXRDb250ZXh0KFwicnVidXNEb2NDb25maWdcIik7XG5cbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInJ1YnVzLWxvY2FsLWNvbmZpZy10aGVtZVwiKSkge1xuICAgICAgJF9ydWJ1c0RvY0NvbmZpZy50aGVtZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInJ1YnVzLWxvY2FsLWNvbmZpZy10aGVtZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwicnVidXMtbG9jYWwtY29uZmlnLXRoZW1lXCIsICRfcnVidXNEb2NDb25maWcudGhlbWUpO1xuICAgIH1cbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwicnVidXMtbG9jYWwtY29uZmlnLWxhbmdcIikpIHtcbiAgICAgICRfcnVidXNEb2NDb25maWcubGFuZyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInJ1YnVzLWxvY2FsLWNvbmZpZy1sYW5nXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJydWJ1cy1sb2NhbC1jb25maWctbGFuZ1wiLCAkX3J1YnVzRG9jQ29uZmlnLmxhbmcpO1xuICAgIH1cbiAgfSk7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICBtYWluIHtcbiAgICBtYXJnaW4tdG9wOiAxMDBweDtcbiAgICBtYXgtd2lkdGg6IDEyMDBweDtcbiAgICBtYXJnaW4tbGVmdDogYXV0bztcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG4gIH1cbjwvc3R5bGU+XG5cbjxDb3JuZXJzdG9uZSBzcGVjdHJ1bVRoZW1lPXskX3J1YnVzRG9jQ29uZmlnLnRoZW1lfT5cbiAgPE5hdiB7c2VnbWVudH0gLz5cbiAgPG1haW4+XG4gICAgPHNsb3QgLz5cbiAgPC9tYWluPlxuPC9Db3JuZXJzdG9uZT5cbiIsIjxzY3JpcHQ+XG5cdGV4cG9ydCBsZXQgc3RhdHVzO1xuXHRleHBvcnQgbGV0IGVycm9yO1xuXG5cdGNvbnN0IGRldiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnO1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cblx0aDEsIHAge1xuXHRcdG1hcmdpbjogMCBhdXRvO1xuXHR9XG5cblx0aDEge1xuXHRcdGZvbnQtc2l6ZTogMi44ZW07XG5cdFx0Zm9udC13ZWlnaHQ6IDcwMDtcblx0XHRtYXJnaW46IDAgMCAwLjVlbSAwO1xuXHR9XG5cblx0cCB7XG5cdFx0bWFyZ2luOiAxZW0gYXV0bztcblx0fVxuXG5cdEBtZWRpYSAobWluLXdpZHRoOiA0ODBweCkge1xuXHRcdGgxIHtcblx0XHRcdGZvbnQtc2l6ZTogNGVtO1xuXHRcdH1cblx0fVxuPC9zdHlsZT5cblxuPHN2ZWx0ZTpoZWFkPlxuXHQ8dGl0bGU+e3N0YXR1c308L3RpdGxlPlxuPC9zdmVsdGU6aGVhZD5cblxuPGgxPntzdGF0dXN9PC9oMT5cblxuPHA+e2Vycm9yLm1lc3NhZ2V9PC9wPlxuXG57I2lmIGRldiAmJiBlcnJvci5zdGFja31cblx0PHByZT57ZXJyb3Iuc3RhY2t9PC9wcmU+XG57L2lmfVxuIiwiPCEtLSBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGJ5IFNhcHBlciDigJQgZG8gbm90IGVkaXQgaXQhIC0tPlxuPHNjcmlwdD5cblx0aW1wb3J0IHsgc2V0Q29udGV4dCwgYWZ0ZXJVcGRhdGUgfSBmcm9tICdzdmVsdGUnO1xuXHRpbXBvcnQgeyBDT05URVhUX0tFWSB9IGZyb20gJy4vc2hhcmVkJztcblx0aW1wb3J0IExheW91dCBmcm9tICcuLi8uLi8uLi9yb3V0ZXMvX2xheW91dC5zdmVsdGUnO1xuXHRpbXBvcnQgRXJyb3IgZnJvbSAnLi4vLi4vLi4vcm91dGVzL19lcnJvci5zdmVsdGUnO1xuXG5cdGV4cG9ydCBsZXQgc3RvcmVzO1xuXHRleHBvcnQgbGV0IGVycm9yO1xuXHRleHBvcnQgbGV0IHN0YXR1cztcblx0ZXhwb3J0IGxldCBzZWdtZW50cztcblx0ZXhwb3J0IGxldCBsZXZlbDA7XG5cdGV4cG9ydCBsZXQgbGV2ZWwxID0gbnVsbDtcblx0ZXhwb3J0IGxldCBsZXZlbDIgPSBudWxsO1xuXHRleHBvcnQgbGV0IG5vdGlmeTtcblxuXHRhZnRlclVwZGF0ZShub3RpZnkpO1xuXHRzZXRDb250ZXh0KENPTlRFWFRfS0VZLCBzdG9yZXMpO1xuPC9zY3JpcHQ+XG5cbjxMYXlvdXQgc2VnbWVudD1cIntzZWdtZW50c1swXX1cIiB7Li4ubGV2ZWwwLnByb3BzfT5cblx0eyNpZiBlcnJvcn1cblx0XHQ8RXJyb3Ige2Vycm9yfSB7c3RhdHVzfS8+XG5cdHs6ZWxzZX1cblx0XHQ8c3ZlbHRlOmNvbXBvbmVudCB0aGlzPVwie2xldmVsMS5jb21wb25lbnR9XCIgc2VnbWVudD1cIntzZWdtZW50c1sxXX1cIiB7Li4ubGV2ZWwxLnByb3BzfT5cblx0XHRcdHsjaWYgbGV2ZWwyfVxuXHRcdFx0XHQ8c3ZlbHRlOmNvbXBvbmVudCB0aGlzPVwie2xldmVsMi5jb21wb25lbnR9XCIgey4uLmxldmVsMi5wcm9wc30vPlxuXHRcdFx0ey9pZn1cblx0XHQ8L3N2ZWx0ZTpjb21wb25lbnQ+XG5cdHsvaWZ9XG48L0xheW91dD4iLCIvLyBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGJ5IFNhcHBlciDigJQgZG8gbm90IGVkaXQgaXQhXG4vLyB3ZWJwYWNrIGRvZXMgbm90IHN1cHBvcnQgZXhwb3J0ICogYXMgcm9vdF9jb21wIHlldCBzbyBkbyBhIHR3byBsaW5lIGltcG9ydC9leHBvcnRcbmltcG9ydCAqIGFzIHJvb3RfY29tcCBmcm9tICcuLi8uLi8uLi9yb3V0ZXMvX2xheW91dC5zdmVsdGUnO1xuZXhwb3J0IHsgcm9vdF9jb21wIH07XG5leHBvcnQgeyBkZWZhdWx0IGFzIEVycm9yQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vcm91dGVzL19lcnJvci5zdmVsdGUnO1xuXG5leHBvcnQgY29uc3QgaWdub3JlID0gW107XG5cbmV4cG9ydCBjb25zdCBjb21wb25lbnRzID0gW1xuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9pbmRleC5zdmVsdGVcIilcblx0fSxcblx0e1xuXHRcdGpzOiAoKSA9PiBpbXBvcnQoXCIuLi8uLi8uLi9yb3V0ZXMvZG9jcy9fbGF5b3V0LnN2ZWx0ZVwiKVxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9kb2NzL2luZGV4LnN2ZWx0ZVwiKVxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9kb2NzL2Nzc3Rva2Vucy9jb2xvci9pbmRleC5zdmVsdGVcIilcblx0fVxuXTtcblxuZXhwb3J0IGNvbnN0IHJvdXRlcyA9IFtcblx0e1xuXHRcdC8vIGluZGV4LnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvJC8sXG5cdFx0cGFydHM6IFtcblx0XHRcdHsgaTogMCB9XG5cdFx0XVxuXHR9LFxuXG5cdHtcblx0XHQvLyBkb2NzL2luZGV4LnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvZG9jc1xcLz8kLyxcblx0XHRwYXJ0czogW1xuXHRcdFx0eyBpOiAxIH0sXG5cdFx0XHR7IGk6IDIgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gZG9jcy9jc3N0b2tlbnMvY29sb3IvaW5kZXguc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC9kb2NzXFwvY3NzdG9rZW5zXFwvY29sb3JcXC8/JC8sXG5cdFx0cGFydHM6IFtcblx0XHRcdHsgaTogMSB9LFxuXHRcdFx0bnVsbCxcblx0XHRcdHsgaTogMyB9XG5cdFx0XVxuXHR9XG5dO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0aW1wb3J0KFwiL1VzZXJzL3J1bm5pbmd6cy9EZXNrdG9wL3J1YnVzLWRvYy9ub2RlX21vZHVsZXMvc2FwcGVyL3NhcHBlci1kZXYtY2xpZW50LmpzXCIpLnRoZW4oY2xpZW50ID0+IHtcblx0XHRjbGllbnQuY29ubmVjdCgxMDAwMCk7XG5cdH0pO1xufSIsImltcG9ydCB7IGdldENvbnRleHQgfSBmcm9tICdzdmVsdGUnO1xuaW1wb3J0IHsgQ09OVEVYVF9LRVkgfSBmcm9tICcuL2ludGVybmFsL3NoYXJlZCc7XG5pbXBvcnQgeyB3cml0YWJsZSB9IGZyb20gJ3N2ZWx0ZS9zdG9yZSc7XG5pbXBvcnQgQXBwIGZyb20gJy4vaW50ZXJuYWwvQXBwLnN2ZWx0ZSc7XG5pbXBvcnQgeyBpZ25vcmUsIHJvdXRlcywgcm9vdF9jb21wLCBjb21wb25lbnRzLCBFcnJvckNvbXBvbmVudCB9IGZyb20gJy4vaW50ZXJuYWwvbWFuaWZlc3QtY2xpZW50JztcblxuLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuXHJcbmZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cblxuZnVuY3Rpb24gZmluZF9hbmNob3Iobm9kZSkge1xyXG4gICAgd2hpbGUgKG5vZGUgJiYgbm9kZS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9PSAnQScpXHJcbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTsgLy8gU1ZHIDxhPiBlbGVtZW50cyBoYXZlIGEgbG93ZXJjYXNlIG5hbWVcclxuICAgIHJldHVybiBub2RlO1xyXG59XG5cbmxldCB1aWQgPSAxO1xyXG5mdW5jdGlvbiBzZXRfdWlkKG4pIHtcclxuICAgIHVpZCA9IG47XHJcbn1cclxubGV0IGNpZDtcclxuZnVuY3Rpb24gc2V0X2NpZChuKSB7XHJcbiAgICBjaWQgPSBuO1xyXG59XHJcbmNvbnN0IF9oaXN0b3J5ID0gdHlwZW9mIGhpc3RvcnkgIT09ICd1bmRlZmluZWQnID8gaGlzdG9yeSA6IHtcclxuICAgIHB1c2hTdGF0ZTogKCkgPT4geyB9LFxyXG4gICAgcmVwbGFjZVN0YXRlOiAoKSA9PiB7IH0sXHJcbiAgICBzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nXHJcbn07XHJcbmNvbnN0IHNjcm9sbF9oaXN0b3J5ID0ge307XHJcbmZ1bmN0aW9uIGxvYWRfY3VycmVudF9wYWdlKCkge1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHsgaGFzaCwgaHJlZiB9ID0gbG9jYXRpb247XHJcbiAgICAgICAgX2hpc3RvcnkucmVwbGFjZVN0YXRlKHsgaWQ6IHVpZCB9LCAnJywgaHJlZik7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldChuZXcgVVJMKGxvY2F0aW9uLmhyZWYpKTtcclxuICAgICAgICBpZiAodGFyZ2V0KVxyXG4gICAgICAgICAgICByZXR1cm4gbmF2aWdhdGUodGFyZ2V0LCB1aWQsIHRydWUsIGhhc2gpO1xyXG4gICAgfSk7XHJcbn1cclxubGV0IGJhc2VfdXJsO1xyXG5sZXQgaGFuZGxlX3RhcmdldDtcclxuZnVuY3Rpb24gaW5pdChiYXNlLCBoYW5kbGVyKSB7XHJcbiAgICBiYXNlX3VybCA9IGJhc2U7XHJcbiAgICBoYW5kbGVfdGFyZ2V0ID0gaGFuZGxlcjtcclxuICAgIGlmICgnc2Nyb2xsUmVzdG9yYXRpb24nIGluIF9oaXN0b3J5KSB7XHJcbiAgICAgICAgX2hpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSAnbWFudWFsJztcclxuICAgIH1cclxuICAgIC8vIEFkb3B0ZWQgZnJvbSBOdXh0LmpzXHJcbiAgICAvLyBSZXNldCBzY3JvbGxSZXN0b3JhdGlvbiB0byBhdXRvIHdoZW4gbGVhdmluZyBwYWdlLCBhbGxvd2luZyBwYWdlIHJlbG9hZFxyXG4gICAgLy8gYW5kIGJhY2stbmF2aWdhdGlvbiBmcm9tIG90aGVyIHBhZ2VzIHRvIHVzZSB0aGUgYnJvd3NlciB0byByZXN0b3JlIHRoZVxyXG4gICAgLy8gc2Nyb2xsaW5nIHBvc2l0aW9uLlxyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgKCkgPT4ge1xyXG4gICAgICAgIF9oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uID0gJ2F1dG8nO1xyXG4gICAgfSk7XHJcbiAgICAvLyBTZXR0aW5nIHNjcm9sbFJlc3RvcmF0aW9uIHRvIG1hbnVhbCBhZ2FpbiB3aGVuIHJldHVybmluZyB0byB0aGlzIHBhZ2UuXHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgIF9oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uID0gJ21hbnVhbCc7XHJcbiAgICB9KTtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlX2NsaWNrKTtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgaGFuZGxlX3BvcHN0YXRlKTtcclxufVxyXG5mdW5jdGlvbiBleHRyYWN0X3F1ZXJ5KHNlYXJjaCkge1xyXG4gICAgY29uc3QgcXVlcnkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gICAgaWYgKHNlYXJjaC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgc2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJykuZm9yRWFjaChzZWFyY2hQYXJhbSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IFssIGtleSwgdmFsdWUgPSAnJ10gPSAvKFtePV0qKSg/Oj0oLiopKT8vLmV4ZWMoZGVjb2RlVVJJQ29tcG9uZW50KHNlYXJjaFBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpKSk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcXVlcnlba2V5XSA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICBxdWVyeVtrZXldID0gW3F1ZXJ5W2tleV1dO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHF1ZXJ5W2tleV0gPT09ICdvYmplY3QnKVxyXG4gICAgICAgICAgICAgICAgcXVlcnlba2V5XS5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcXVlcnlba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHF1ZXJ5O1xyXG59XHJcbmZ1bmN0aW9uIHNlbGVjdF90YXJnZXQodXJsKSB7XHJcbiAgICBpZiAodXJsLm9yaWdpbiAhPT0gbG9jYXRpb24ub3JpZ2luKVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgaWYgKCF1cmwucGF0aG5hbWUuc3RhcnRzV2l0aChiYXNlX3VybCkpXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICBsZXQgcGF0aCA9IHVybC5wYXRobmFtZS5zbGljZShiYXNlX3VybC5sZW5ndGgpO1xyXG4gICAgaWYgKHBhdGggPT09ICcnKSB7XHJcbiAgICAgICAgcGF0aCA9ICcvJztcclxuICAgIH1cclxuICAgIC8vIGF2b2lkIGFjY2lkZW50YWwgY2xhc2hlcyBiZXR3ZWVuIHNlcnZlciByb3V0ZXMgYW5kIHBhZ2Ugcm91dGVzXHJcbiAgICBpZiAoaWdub3JlLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLnRlc3QocGF0aCkpKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgY29uc3Qgcm91dGUgPSByb3V0ZXNbaV07XHJcbiAgICAgICAgY29uc3QgbWF0Y2ggPSByb3V0ZS5wYXR0ZXJuLmV4ZWMocGF0aCk7XHJcbiAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gZXh0cmFjdF9xdWVyeSh1cmwuc2VhcmNoKTtcclxuICAgICAgICAgICAgY29uc3QgcGFydCA9IHJvdXRlLnBhcnRzW3JvdXRlLnBhcnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBwYXJ0LnBhcmFtcyA/IHBhcnQucGFyYW1zKG1hdGNoKSA6IHt9O1xyXG4gICAgICAgICAgICBjb25zdCBwYWdlID0geyBob3N0OiBsb2NhdGlvbi5ob3N0LCBwYXRoLCBxdWVyeSwgcGFyYW1zIH07XHJcbiAgICAgICAgICAgIHJldHVybiB7IGhyZWY6IHVybC5ocmVmLCByb3V0ZSwgbWF0Y2gsIHBhZ2UgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gaGFuZGxlX2NsaWNrKGV2ZW50KSB7XHJcbiAgICAvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanNcclxuICAgIC8vIE1JVCBsaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzI2xpY2Vuc2VcclxuICAgIGlmICh3aGljaChldmVudCkgIT09IDEpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgaWYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSB8fCBldmVudC5zaGlmdEtleSB8fCBldmVudC5hbHRLZXkpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgaWYgKGV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgY29uc3QgYSA9IGZpbmRfYW5jaG9yKGV2ZW50LnRhcmdldCk7XHJcbiAgICBpZiAoIWEpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgaWYgKCFhLmhyZWYpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXHJcbiAgICAvLyBpbiB0aGlzIGNhc2UsIGJvdGggaHJlZiBhbmQgdGFyZ2V0IGFyZSBhbHdheXMgaW5zaWRlIGFuIG9iamVjdFxyXG4gICAgY29uc3Qgc3ZnID0gdHlwZW9mIGEuaHJlZiA9PT0gJ29iamVjdCcgJiYgYS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTVkdBbmltYXRlZFN0cmluZyc7XHJcbiAgICBjb25zdCBocmVmID0gU3RyaW5nKHN2ZyA/IGEuaHJlZi5iYXNlVmFsIDogYS5ocmVmKTtcclxuICAgIGlmIChocmVmID09PSBsb2NhdGlvbi5ocmVmKSB7XHJcbiAgICAgICAgaWYgKCFsb2NhdGlvbi5oYXNoKVxyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIElnbm9yZSBpZiB0YWcgaGFzXHJcbiAgICAvLyAxLiAnZG93bmxvYWQnIGF0dHJpYnV0ZVxyXG4gICAgLy8gMi4gcmVsPSdleHRlcm5hbCcgYXR0cmlidXRlXHJcbiAgICBpZiAoYS5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgYS5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIC8vIElnbm9yZSBpZiA8YT4gaGFzIGEgdGFyZ2V0XHJcbiAgICBpZiAoc3ZnID8gYS50YXJnZXQuYmFzZVZhbCA6IGEudGFyZ2V0KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoaHJlZik7XHJcbiAgICAvLyBEb24ndCBoYW5kbGUgaGFzaCBjaGFuZ2VzXHJcbiAgICBpZiAodXJsLnBhdGhuYW1lID09PSBsb2NhdGlvbi5wYXRobmFtZSAmJiB1cmwuc2VhcmNoID09PSBsb2NhdGlvbi5zZWFyY2gpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldCh1cmwpO1xyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIGNvbnN0IG5vc2Nyb2xsID0gYS5oYXNBdHRyaWJ1dGUoJ3NhcHBlcjpub3Njcm9sbCcpO1xyXG4gICAgICAgIG5hdmlnYXRlKHRhcmdldCwgbnVsbCwgbm9zY3JvbGwsIHVybC5oYXNoKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIF9oaXN0b3J5LnB1c2hTdGF0ZSh7IGlkOiBjaWQgfSwgJycsIHVybC5ocmVmKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiB3aGljaChldmVudCkge1xyXG4gICAgcmV0dXJuIGV2ZW50LndoaWNoID09PSBudWxsID8gZXZlbnQuYnV0dG9uIDogZXZlbnQud2hpY2g7XHJcbn1cclxuZnVuY3Rpb24gc2Nyb2xsX3N0YXRlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBwYWdlWE9mZnNldCxcclxuICAgICAgICB5OiBwYWdlWU9mZnNldFxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiBoYW5kbGVfcG9wc3RhdGUoZXZlbnQpIHtcclxuICAgIHNjcm9sbF9oaXN0b3J5W2NpZF0gPSBzY3JvbGxfc3RhdGUoKTtcclxuICAgIGlmIChldmVudC5zdGF0ZSkge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldCh1cmwpO1xyXG4gICAgICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgbmF2aWdhdGUodGFyZ2V0LCBldmVudC5zdGF0ZS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7IC8vIG5vc29uYXJcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBoYXNoY2hhbmdlXHJcbiAgICAgICAgc2V0X3VpZCh1aWQgKyAxKTtcclxuICAgICAgICBzZXRfY2lkKHVpZCk7XHJcbiAgICAgICAgX2hpc3RvcnkucmVwbGFjZVN0YXRlKHsgaWQ6IGNpZCB9LCAnJywgbG9jYXRpb24uaHJlZik7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gbmF2aWdhdGUoZGVzdCwgaWQsIG5vc2Nyb2xsLCBoYXNoKSB7XHJcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgIGNvbnN0IHBvcHN0YXRlID0gISFpZDtcclxuICAgICAgICBpZiAocG9wc3RhdGUpIHtcclxuICAgICAgICAgICAgY2lkID0gaWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50X3Njcm9sbCA9IHNjcm9sbF9zdGF0ZSgpO1xyXG4gICAgICAgICAgICAvLyBjbGlja2VkIG9uIGEgbGluay4gcHJlc2VydmUgc2Nyb2xsIHN0YXRlXHJcbiAgICAgICAgICAgIHNjcm9sbF9oaXN0b3J5W2NpZF0gPSBjdXJyZW50X3Njcm9sbDtcclxuICAgICAgICAgICAgY2lkID0gaWQgPSArK3VpZDtcclxuICAgICAgICAgICAgc2Nyb2xsX2hpc3RvcnlbY2lkXSA9IG5vc2Nyb2xsID8gY3VycmVudF9zY3JvbGwgOiB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeWllbGQgaGFuZGxlX3RhcmdldChkZXN0KTtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSlcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgaWYgKCFub3Njcm9sbCkge1xyXG4gICAgICAgICAgICBsZXQgc2Nyb2xsID0gc2Nyb2xsX2hpc3RvcnlbaWRdO1xyXG4gICAgICAgICAgICBsZXQgZGVlcF9saW5rZWQ7XHJcbiAgICAgICAgICAgIGlmIChoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzY3JvbGwgaXMgYW4gZWxlbWVudCBpZCAoZnJvbSBhIGhhc2gpLCB3ZSBuZWVkIHRvIGNvbXB1dGUgeS5cclxuICAgICAgICAgICAgICAgIGRlZXBfbGlua2VkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGFzaC5zbGljZSgxKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVlcF9saW5rZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGwgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IGRlZXBfbGlua2VkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIHNjcm9sbFlcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNjcm9sbF9oaXN0b3J5W2NpZF0gPSBzY3JvbGw7XHJcbiAgICAgICAgICAgIGlmIChwb3BzdGF0ZSB8fCBkZWVwX2xpbmtlZCkge1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG8oc2Nyb2xsLngsIHNjcm9sbC55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNjcm9sbFRvKDAsIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cblxuZnVuY3Rpb24gZ2V0X2Jhc2VfdXJpKHdpbmRvd19kb2N1bWVudCkge1xyXG4gICAgbGV0IGJhc2VVUkkgPSB3aW5kb3dfZG9jdW1lbnQuYmFzZVVSSTtcclxuICAgIGlmICghYmFzZVVSSSkge1xyXG4gICAgICAgIGNvbnN0IGJhc2VUYWdzID0gd2luZG93X2RvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XHJcbiAgICAgICAgYmFzZVVSSSA9IGJhc2VUYWdzLmxlbmd0aCA/IGJhc2VUYWdzWzBdLmhyZWYgOiB3aW5kb3dfZG9jdW1lbnQuVVJMO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJhc2VVUkk7XHJcbn1cblxubGV0IHByZWZldGNoaW5nID0gbnVsbDtcclxubGV0IG1vdXNlbW92ZV90aW1lb3V0O1xyXG5mdW5jdGlvbiBzdGFydCgpIHtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0cmlnZ2VyX3ByZWZldGNoKTtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGhhbmRsZV9tb3VzZW1vdmUpO1xyXG59XHJcbmZ1bmN0aW9uIHByZWZldGNoKGhyZWYpIHtcclxuICAgIGNvbnN0IHRhcmdldCA9IHNlbGVjdF90YXJnZXQobmV3IFVSTChocmVmLCBnZXRfYmFzZV91cmkoZG9jdW1lbnQpKSk7XHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgaWYgKCFwcmVmZXRjaGluZyB8fCBocmVmICE9PSBwcmVmZXRjaGluZy5ocmVmKSB7XHJcbiAgICAgICAgICAgIHByZWZldGNoaW5nID0geyBocmVmLCBwcm9taXNlOiBoeWRyYXRlX3RhcmdldCh0YXJnZXQpIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwcmVmZXRjaGluZy5wcm9taXNlO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGdldF9wcmVmZXRjaGVkKHRhcmdldCkge1xyXG4gICAgaWYgKHByZWZldGNoaW5nICYmIHByZWZldGNoaW5nLmhyZWYgPT09IHRhcmdldC5ocmVmKSB7XHJcbiAgICAgICAgcmV0dXJuIHByZWZldGNoaW5nLnByb21pc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gaHlkcmF0ZV90YXJnZXQodGFyZ2V0KTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiB0cmlnZ2VyX3ByZWZldGNoKGV2ZW50KSB7XHJcbiAgICBjb25zdCBhID0gZmluZF9hbmNob3IoZXZlbnQudGFyZ2V0KTtcclxuICAgIGlmIChhICYmIGEucmVsID09PSAncHJlZmV0Y2gnKSB7XHJcbiAgICAgICAgcHJlZmV0Y2goYS5ocmVmKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBoYW5kbGVfbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICBjbGVhclRpbWVvdXQobW91c2Vtb3ZlX3RpbWVvdXQpO1xyXG4gICAgbW91c2Vtb3ZlX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0cmlnZ2VyX3ByZWZldGNoKGV2ZW50KTtcclxuICAgIH0sIDIwKTtcclxufVxuXG5mdW5jdGlvbiBnb3RvKGhyZWYsIG9wdHMgPSB7IG5vc2Nyb2xsOiBmYWxzZSwgcmVwbGFjZVN0YXRlOiBmYWxzZSB9KSB7XHJcbiAgICBjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KG5ldyBVUkwoaHJlZiwgZ2V0X2Jhc2VfdXJpKGRvY3VtZW50KSkpO1xyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIF9oaXN0b3J5W29wdHMucmVwbGFjZVN0YXRlID8gJ3JlcGxhY2VTdGF0ZScgOiAncHVzaFN0YXRlJ10oeyBpZDogY2lkIH0sICcnLCBocmVmKTtcclxuICAgICAgICByZXR1cm4gbmF2aWdhdGUodGFyZ2V0LCBudWxsLCBvcHRzLm5vc2Nyb2xsKTtcclxuICAgIH1cclxuICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcclxuICAgICAgICAvKiBuZXZlciByZXNvbHZlcyAqL1xyXG4gICAgfSk7XHJcbn1cblxuZnVuY3Rpb24gcGFnZV9zdG9yZSh2YWx1ZSkge1xyXG4gICAgY29uc3Qgc3RvcmUgPSB3cml0YWJsZSh2YWx1ZSk7XHJcbiAgICBsZXQgcmVhZHkgPSB0cnVlO1xyXG4gICAgZnVuY3Rpb24gbm90aWZ5KCkge1xyXG4gICAgICAgIHJlYWR5ID0gdHJ1ZTtcclxuICAgICAgICBzdG9yZS51cGRhdGUodmFsID0+IHZhbCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzZXQobmV3X3ZhbHVlKSB7XHJcbiAgICAgICAgcmVhZHkgPSBmYWxzZTtcclxuICAgICAgICBzdG9yZS5zZXQobmV3X3ZhbHVlKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZShydW4pIHtcclxuICAgICAgICBsZXQgb2xkX3ZhbHVlO1xyXG4gICAgICAgIHJldHVybiBzdG9yZS5zdWJzY3JpYmUoKG5ld192YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAob2xkX3ZhbHVlID09PSB1bmRlZmluZWQgfHwgKHJlYWR5ICYmIG5ld192YWx1ZSAhPT0gb2xkX3ZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcnVuKG9sZF92YWx1ZSA9IG5ld192YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiB7IG5vdGlmeSwgc2V0LCBzdWJzY3JpYmUgfTtcclxufVxuXG5jb25zdCBpbml0aWFsX2RhdGEgPSB0eXBlb2YgX19TQVBQRVJfXyAhPT0gJ3VuZGVmaW5lZCcgJiYgX19TQVBQRVJfXztcclxubGV0IHJlYWR5ID0gZmFsc2U7XHJcbmxldCByb290X2NvbXBvbmVudDtcclxubGV0IGN1cnJlbnRfdG9rZW47XHJcbmxldCByb290X3ByZWxvYWRlZDtcclxubGV0IGN1cnJlbnRfYnJhbmNoID0gW107XHJcbmxldCBjdXJyZW50X3F1ZXJ5ID0gJ3t9JztcclxuY29uc3Qgc3RvcmVzID0ge1xyXG4gICAgcGFnZTogcGFnZV9zdG9yZSh7fSksXHJcbiAgICBwcmVsb2FkaW5nOiB3cml0YWJsZShudWxsKSxcclxuICAgIHNlc3Npb246IHdyaXRhYmxlKGluaXRpYWxfZGF0YSAmJiBpbml0aWFsX2RhdGEuc2Vzc2lvbilcclxufTtcclxubGV0ICRzZXNzaW9uO1xyXG5sZXQgc2Vzc2lvbl9kaXJ0eTtcclxuc3RvcmVzLnNlc3Npb24uc3Vic2NyaWJlKCh2YWx1ZSkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAkc2Vzc2lvbiA9IHZhbHVlO1xyXG4gICAgaWYgKCFyZWFkeSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICBzZXNzaW9uX2RpcnR5ID0gdHJ1ZTtcclxuICAgIGNvbnN0IGRlc3QgPSBzZWxlY3RfdGFyZ2V0KG5ldyBVUkwobG9jYXRpb24uaHJlZikpO1xyXG4gICAgY29uc3QgdG9rZW4gPSBjdXJyZW50X3Rva2VuID0ge307XHJcbiAgICBjb25zdCB7IHJlZGlyZWN0LCBwcm9wcywgYnJhbmNoIH0gPSB5aWVsZCBoeWRyYXRlX3RhcmdldChkZXN0KTtcclxuICAgIGlmICh0b2tlbiAhPT0gY3VycmVudF90b2tlbilcclxuICAgICAgICByZXR1cm47IC8vIGEgc2Vjb25kYXJ5IG5hdmlnYXRpb24gaGFwcGVuZWQgd2hpbGUgd2Ugd2VyZSBsb2FkaW5nXHJcbiAgICBpZiAocmVkaXJlY3QpIHtcclxuICAgICAgICB5aWVsZCBnb3RvKHJlZGlyZWN0LmxvY2F0aW9uLCB7IHJlcGxhY2VTdGF0ZTogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHlpZWxkIHJlbmRlcihicmFuY2gsIHByb3BzLCBidWlsZFBhZ2VDb250ZXh0KHByb3BzLCBkZXN0LnBhZ2UpKTtcclxuICAgIH1cclxufSkpO1xyXG5sZXQgdGFyZ2V0O1xyXG5mdW5jdGlvbiBzZXRfdGFyZ2V0KG5vZGUpIHtcclxuICAgIHRhcmdldCA9IG5vZGU7XHJcbn1cclxuZnVuY3Rpb24gc3RhcnQkMShvcHRzKSB7XHJcbiAgICBzZXRfdGFyZ2V0KG9wdHMudGFyZ2V0KTtcclxuICAgIGluaXQoaW5pdGlhbF9kYXRhLmJhc2VVcmwsIGhhbmRsZV90YXJnZXQkMSk7XHJcbiAgICBzdGFydCgpO1xyXG4gICAgaWYgKGluaXRpYWxfZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZV9lcnJvcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGxvYWRfY3VycmVudF9wYWdlKCk7XHJcbn1cclxuZnVuY3Rpb24gaGFuZGxlX2Vycm9yKCkge1xyXG4gICAgY29uc3QgeyBob3N0LCBwYXRobmFtZSwgc2VhcmNoIH0gPSBsb2NhdGlvbjtcclxuICAgIGNvbnN0IHsgc2Vzc2lvbiwgcHJlbG9hZGVkLCBzdGF0dXMsIGVycm9yIH0gPSBpbml0aWFsX2RhdGE7XHJcbiAgICBpZiAoIXJvb3RfcHJlbG9hZGVkKSB7XHJcbiAgICAgICAgcm9vdF9wcmVsb2FkZWQgPSBwcmVsb2FkZWQgJiYgcHJlbG9hZGVkWzBdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcHJvcHMgPSB7XHJcbiAgICAgICAgZXJyb3IsXHJcbiAgICAgICAgc3RhdHVzLFxyXG4gICAgICAgIHNlc3Npb24sXHJcbiAgICAgICAgbGV2ZWwwOiB7XHJcbiAgICAgICAgICAgIHByb3BzOiByb290X3ByZWxvYWRlZFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGV2ZWwxOiB7XHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBzdGF0dXMsXHJcbiAgICAgICAgICAgICAgICBlcnJvclxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb21wb25lbnQ6IEVycm9yQ29tcG9uZW50XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWdtZW50czogcHJlbG9hZGVkXHJcbiAgICB9O1xyXG4gICAgY29uc3QgcXVlcnkgPSBleHRyYWN0X3F1ZXJ5KHNlYXJjaCk7XHJcbiAgICByZW5kZXIoW10sIHByb3BzLCB7IGhvc3QsIHBhdGg6IHBhdGhuYW1lLCBxdWVyeSwgcGFyYW1zOiB7fSwgZXJyb3IgfSk7XHJcbn1cclxuZnVuY3Rpb24gYnVpbGRQYWdlQ29udGV4dChwcm9wcywgcGFnZSkge1xyXG4gICAgY29uc3QgeyBlcnJvciB9ID0gcHJvcHM7XHJcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7IGVycm9yIH0sIHBhZ2UpO1xyXG59XHJcbmZ1bmN0aW9uIGhhbmRsZV90YXJnZXQkMShkZXN0KSB7XHJcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgIGlmIChyb290X2NvbXBvbmVudClcclxuICAgICAgICAgICAgc3RvcmVzLnByZWxvYWRpbmcuc2V0KHRydWUpO1xyXG4gICAgICAgIGNvbnN0IGh5ZHJhdGluZyA9IGdldF9wcmVmZXRjaGVkKGRlc3QpO1xyXG4gICAgICAgIGNvbnN0IHRva2VuID0gY3VycmVudF90b2tlbiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGh5ZHJhdGVkX3RhcmdldCA9IHlpZWxkIGh5ZHJhdGluZztcclxuICAgICAgICBjb25zdCB7IHJlZGlyZWN0IH0gPSBoeWRyYXRlZF90YXJnZXQ7XHJcbiAgICAgICAgaWYgKHRva2VuICE9PSBjdXJyZW50X3Rva2VuKVxyXG4gICAgICAgICAgICByZXR1cm47IC8vIGEgc2Vjb25kYXJ5IG5hdmlnYXRpb24gaGFwcGVuZWQgd2hpbGUgd2Ugd2VyZSBsb2FkaW5nXHJcbiAgICAgICAgaWYgKHJlZGlyZWN0KSB7XHJcbiAgICAgICAgICAgIHlpZWxkIGdvdG8ocmVkaXJlY3QubG9jYXRpb24sIHsgcmVwbGFjZVN0YXRlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgeyBwcm9wcywgYnJhbmNoIH0gPSBoeWRyYXRlZF90YXJnZXQ7XHJcbiAgICAgICAgICAgIHlpZWxkIHJlbmRlcihicmFuY2gsIHByb3BzLCBidWlsZFBhZ2VDb250ZXh0KHByb3BzLCBkZXN0LnBhZ2UpKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5mdW5jdGlvbiByZW5kZXIoYnJhbmNoLCBwcm9wcywgcGFnZSkge1xyXG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICBzdG9yZXMucGFnZS5zZXQocGFnZSk7XHJcbiAgICAgICAgc3RvcmVzLnByZWxvYWRpbmcuc2V0KGZhbHNlKTtcclxuICAgICAgICBpZiAocm9vdF9jb21wb25lbnQpIHtcclxuICAgICAgICAgICAgcm9vdF9jb21wb25lbnQuJHNldChwcm9wcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwcm9wcy5zdG9yZXMgPSB7XHJcbiAgICAgICAgICAgICAgICBwYWdlOiB7IHN1YnNjcmliZTogc3RvcmVzLnBhZ2Uuc3Vic2NyaWJlIH0sXHJcbiAgICAgICAgICAgICAgICBwcmVsb2FkaW5nOiB7IHN1YnNjcmliZTogc3RvcmVzLnByZWxvYWRpbmcuc3Vic2NyaWJlIH0sXHJcbiAgICAgICAgICAgICAgICBzZXNzaW9uOiBzdG9yZXMuc2Vzc2lvblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwcm9wcy5sZXZlbDAgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wczogeWllbGQgcm9vdF9wcmVsb2FkZWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcHJvcHMubm90aWZ5ID0gc3RvcmVzLnBhZ2Uubm90aWZ5O1xyXG4gICAgICAgICAgICByb290X2NvbXBvbmVudCA9IG5ldyBBcHAoe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LFxyXG4gICAgICAgICAgICAgICAgcHJvcHMsXHJcbiAgICAgICAgICAgICAgICBoeWRyYXRlOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdXJyZW50X2JyYW5jaCA9IGJyYW5jaDtcclxuICAgICAgICBjdXJyZW50X3F1ZXJ5ID0gSlNPTi5zdHJpbmdpZnkocGFnZS5xdWVyeSk7XHJcbiAgICAgICAgcmVhZHkgPSB0cnVlO1xyXG4gICAgICAgIHNlc3Npb25fZGlydHkgPSBmYWxzZTtcclxuICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHBhcnRfY2hhbmdlZChpLCBzZWdtZW50LCBtYXRjaCwgc3RyaW5naWZpZWRfcXVlcnkpIHtcclxuICAgIC8vIFRPRE8gb25seSBjaGVjayBxdWVyeSBzdHJpbmcgY2hhbmdlcyBmb3IgcHJlbG9hZCBmdW5jdGlvbnNcclxuICAgIC8vIHRoYXQgZG8gaW4gZmFjdCBkZXBlbmQgb24gaXQgKHVzaW5nIHN0YXRpYyBhbmFseXNpcyBvclxyXG4gICAgLy8gcnVudGltZSBpbnN0cnVtZW50YXRpb24pXHJcbiAgICBpZiAoc3RyaW5naWZpZWRfcXVlcnkgIT09IGN1cnJlbnRfcXVlcnkpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBjb25zdCBwcmV2aW91cyA9IGN1cnJlbnRfYnJhbmNoW2ldO1xyXG4gICAgaWYgKCFwcmV2aW91cylcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoc2VnbWVudCAhPT0gcHJldmlvdXMuc2VnbWVudClcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGlmIChwcmV2aW91cy5tYXRjaCkge1xyXG4gICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShwcmV2aW91cy5tYXRjaC5zbGljZSgxLCBpICsgMikpICE9PSBKU09OLnN0cmluZ2lmeShtYXRjaC5zbGljZSgxLCBpICsgMikpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBoeWRyYXRlX3RhcmdldChkZXN0KSB7XHJcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgIGNvbnN0IHsgcm91dGUsIHBhZ2UgfSA9IGRlc3Q7XHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBwYWdlLnBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgICAgICAgbGV0IHJlZGlyZWN0ID0gbnVsbDtcclxuICAgICAgICBjb25zdCBwcm9wcyA9IHsgZXJyb3I6IG51bGwsIHN0YXR1czogMjAwLCBzZWdtZW50czogW3NlZ21lbnRzWzBdXSB9O1xyXG4gICAgICAgIGNvbnN0IHByZWxvYWRfY29udGV4dCA9IHtcclxuICAgICAgICAgICAgZmV0Y2g6ICh1cmwsIG9wdHMpID0+IGZldGNoKHVybCwgb3B0cyksXHJcbiAgICAgICAgICAgIHJlZGlyZWN0OiAoc3RhdHVzQ29kZSwgbG9jYXRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdCAmJiAocmVkaXJlY3Quc3RhdHVzQ29kZSAhPT0gc3RhdHVzQ29kZSB8fCByZWRpcmVjdC5sb2NhdGlvbiAhPT0gbG9jYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25mbGljdGluZyByZWRpcmVjdHMnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlZGlyZWN0ID0geyBzdGF0dXNDb2RlLCBsb2NhdGlvbiB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogKHN0YXR1cywgZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIHByb3BzLmVycm9yID0gdHlwZW9mIGVycm9yID09PSAnc3RyaW5nJyA/IG5ldyBFcnJvcihlcnJvcikgOiBlcnJvcjtcclxuICAgICAgICAgICAgICAgIHByb3BzLnN0YXR1cyA9IHN0YXR1cztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKCFyb290X3ByZWxvYWRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCByb290X3ByZWxvYWQgPSByb290X2NvbXAucHJlbG9hZCB8fCAoKCkgPT4gKHt9KSk7XHJcbiAgICAgICAgICAgIHJvb3RfcHJlbG9hZGVkID0gaW5pdGlhbF9kYXRhLnByZWxvYWRlZFswXSB8fCByb290X3ByZWxvYWQuY2FsbChwcmVsb2FkX2NvbnRleHQsIHtcclxuICAgICAgICAgICAgICAgIGhvc3Q6IHBhZ2UuaG9zdCxcclxuICAgICAgICAgICAgICAgIHBhdGg6IHBhZ2UucGF0aCxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5OiBwYWdlLnF1ZXJ5LFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fVxyXG4gICAgICAgICAgICB9LCAkc2Vzc2lvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBicmFuY2g7XHJcbiAgICAgICAgbGV0IGwgPSAxO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmluZ2lmaWVkX3F1ZXJ5ID0gSlNPTi5zdHJpbmdpZnkocGFnZS5xdWVyeSk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gcm91dGUucGF0dGVybi5leGVjKHBhZ2UucGF0aCk7XHJcbiAgICAgICAgICAgIGxldCBzZWdtZW50X2RpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyYW5jaCA9IHlpZWxkIFByb21pc2UuYWxsKHJvdXRlLnBhcnRzLm1hcCgocGFydCwgaSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VnbWVudCA9IHNlZ21lbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRfY2hhbmdlZChpLCBzZWdtZW50LCBtYXRjaCwgc3RyaW5naWZpZWRfcXVlcnkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRfZGlydHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcHMuc2VnbWVudHNbbF0gPSBzZWdtZW50c1tpICsgMV07IC8vIFRPRE8gbWFrZSB0aGlzIGxlc3MgY29uZnVzaW5nXHJcbiAgICAgICAgICAgICAgICBpZiAoIXBhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc2VnbWVudCB9O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaiA9IGwrKztcclxuICAgICAgICAgICAgICAgIGlmICghc2Vzc2lvbl9kaXJ0eSAmJiAhc2VnbWVudF9kaXJ0eSAmJiBjdXJyZW50X2JyYW5jaFtpXSAmJiBjdXJyZW50X2JyYW5jaFtpXS5wYXJ0ID09PSBwYXJ0LmkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudF9icmFuY2hbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZWdtZW50X2RpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IGNvbXBvbmVudCwgcHJlbG9hZCB9ID0geWllbGQgY29tcG9uZW50c1twYXJ0LmldLmpzKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVkO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5IHx8ICFpbml0aWFsX2RhdGEucHJlbG9hZGVkW2kgKyAxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRlZCA9IHByZWxvYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyB5aWVsZCBwcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0OiBwYWdlLmhvc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYWdlLnBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeTogcGFnZS5xdWVyeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogcGFydC5wYXJhbXMgPyBwYXJ0LnBhcmFtcyhkZXN0Lm1hdGNoKSA6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICRzZXNzaW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkID0gaW5pdGlhbF9kYXRhLnByZWxvYWRlZFtpICsgMV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHByb3BzW2BsZXZlbCR7an1gXSA9IHsgY29tcG9uZW50LCBwcm9wczogcHJlbG9hZGVkLCBzZWdtZW50LCBtYXRjaCwgcGFydDogcGFydC5pIH0pO1xyXG4gICAgICAgICAgICB9KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgcHJvcHMuZXJyb3IgPSBlcnJvcjtcclxuICAgICAgICAgICAgcHJvcHMuc3RhdHVzID0gNTAwO1xyXG4gICAgICAgICAgICBicmFuY2ggPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgcmVkaXJlY3QsIHByb3BzLCBicmFuY2ggfTtcclxuICAgIH0pO1xyXG59XG5cbmZ1bmN0aW9uIHByZWZldGNoUm91dGVzKHBhdGhuYW1lcykge1xyXG4gICAgcmV0dXJuIHJvdXRlc1xyXG4gICAgICAgIC5maWx0ZXIocGF0aG5hbWVzXHJcbiAgICAgICAgPyByb3V0ZSA9PiBwYXRobmFtZXMuc29tZShwYXRobmFtZSA9PiByb3V0ZS5wYXR0ZXJuLnRlc3QocGF0aG5hbWUpKVxyXG4gICAgICAgIDogKCkgPT4gdHJ1ZSlcclxuICAgICAgICAucmVkdWNlKChwcm9taXNlLCByb3V0ZSkgPT4gcHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocm91dGUucGFydHMubWFwKHBhcnQgPT4gcGFydCAmJiBjb21wb25lbnRzW3BhcnQuaV0uanMoKSkpO1xyXG4gICAgfSksIFByb21pc2UucmVzb2x2ZSgpKTtcclxufVxuXG5jb25zdCBzdG9yZXMkMSA9ICgpID0+IGdldENvbnRleHQoQ09OVEVYVF9LRVkpO1xuXG5leHBvcnQgeyBnb3RvLCBwcmVmZXRjaCwgcHJlZmV0Y2hSb3V0ZXMsIHN0YXJ0JDEgYXMgc3RhcnQsIHN0b3JlcyQxIGFzIHN0b3JlcyB9O1xuIiwiaW1wb3J0ICogYXMgc2FwcGVyIGZyb20gJ0BzYXBwZXIvYXBwJztcblxuc2FwcGVyLnN0YXJ0KHtcblx0dGFyZ2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2FwcGVyJylcbn0pOyJdLCJuYW1lcyI6WyJjb2xvck5hbWVzIiwic3dpenpsZSIsImNzc0tleXdvcmRzIiwiY29udmVydCIsImluaXQiLCJFcnJvckNvbXBvbmVudCIsInJvb3RfY29tcC5wcmVsb2FkIiwic2FwcGVyLnN0YXJ0Il0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLElBQUksR0FBRyxHQUFHO0FBRW5CLFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDMUI7QUFDQSxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRztBQUN2QixRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsSUFBSSxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFJRCxTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ3pELElBQUksT0FBTyxDQUFDLGFBQWEsR0FBRztBQUM1QixRQUFRLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtBQUN6QyxLQUFLLENBQUM7QUFDTixDQUFDO0FBQ0QsU0FBUyxHQUFHLENBQUMsRUFBRSxFQUFFO0FBQ2pCLElBQUksT0FBTyxFQUFFLEVBQUUsQ0FBQztBQUNoQixDQUFDO0FBQ0QsU0FBUyxZQUFZLEdBQUc7QUFDeEIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUNELFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUN0QixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsQ0FBQztBQUNELFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRTtBQUM1QixJQUFJLE9BQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQ3ZDLENBQUM7QUFDRCxTQUFTLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEtBQUssT0FBTyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUM7QUFDbEcsQ0FBQztBQUlELFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUN2QixJQUFJLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFDRCxTQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO0FBQ3JDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLE9BQU8sS0FBSyxDQUFDLFNBQVMsS0FBSyxVQUFVLEVBQUU7QUFDaEUsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUM7QUFDOUUsS0FBSztBQUNMLENBQUM7QUFDRCxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxTQUFTLEVBQUU7QUFDeEMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDdkIsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0wsSUFBSSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDaEQsSUFBSSxPQUFPLEtBQUssQ0FBQyxXQUFXLEdBQUcsTUFBTSxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBQ2pFLENBQUM7QUFNRCxTQUFTLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO0FBQ3pELElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBQ0QsU0FBUyxXQUFXLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO0FBQ25ELElBQUksSUFBSSxVQUFVLEVBQUU7QUFDcEIsUUFBUSxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RSxRQUFRLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLEtBQUs7QUFDTCxDQUFDO0FBQ0QsU0FBUyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7QUFDeEQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQzlCLFVBQVUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdELFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN0QixDQUFDO0FBQ0QsU0FBUyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDMUQsSUFBSSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDN0IsUUFBUSxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQ3pDLFlBQVksT0FBTyxJQUFJLENBQUM7QUFDeEIsU0FBUztBQUNULFFBQVEsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDdEMsWUFBWSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDOUIsWUFBWSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRSxZQUFZLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM3QyxnQkFBZ0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELGFBQWE7QUFDYixZQUFZLE9BQU8sTUFBTSxDQUFDO0FBQzFCLFNBQVM7QUFDVCxRQUFRLE9BQU8sT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDcEMsS0FBSztBQUNMLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQ3pCLENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFO0FBQzNHLElBQUksTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUNoRyxJQUFJLElBQUksWUFBWSxFQUFFO0FBQ3RCLFFBQVEsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUNsRyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzNDLEtBQUs7QUFDTCxDQUFDO0FBQ0QsU0FBUyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUU7QUFDdkMsSUFBSSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUs7QUFDekIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO0FBQ3hCLFlBQVksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxJQUFJLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFDRCxTQUFTLGtCQUFrQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDekMsSUFBSSxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUs7QUFDekIsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRztBQUN4QyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsSUFBSSxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBb0JELFNBQVMsZUFBZSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRTtBQUNsRCxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckIsSUFBSSxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLGFBQWEsRUFBRTtBQUN6QyxJQUFJLE9BQU8sYUFBYSxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDOUYsQ0FBQztBQWlERDtBQUNBLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDOUIsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFDRCxTQUFTLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUN0QyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBQ0QsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ3RCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUNELFNBQVMsWUFBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUU7QUFDN0MsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ25ELFFBQVEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFlBQVksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN2QyxLQUFLO0FBQ0wsQ0FBQztBQUNELFNBQVMsT0FBTyxDQUFDLElBQUksRUFBRTtBQUN2QixJQUFJLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBZ0JELFNBQVMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUMzQixJQUFJLE9BQU8sUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4RSxDQUFDO0FBQ0QsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ3BCLElBQUksT0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFDRCxTQUFTLEtBQUssR0FBRztBQUNqQixJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLENBQUM7QUFDRCxTQUFTLEtBQUssR0FBRztBQUNqQixJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFDRCxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDL0MsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNuRCxJQUFJLE9BQU8sTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBc0JELFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO0FBQ3RDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSTtBQUNyQixRQUFRLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEMsU0FBUyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSztBQUNuRCxRQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFDRCxTQUFTLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO0FBQzFDO0FBQ0EsSUFBSSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pFLElBQUksS0FBSyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7QUFDbEMsUUFBUSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDckMsWUFBWSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFNBQVM7QUFDVCxhQUFhLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtBQUNsQyxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqRCxTQUFTO0FBQ1QsYUFBYSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7QUFDcEMsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckQsU0FBUztBQUNULGFBQWEsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRTtBQUMzRCxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsU0FBUztBQUNULGFBQWE7QUFDYixZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNELFNBQVMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtBQUM5QyxJQUFJLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFO0FBQ2xDLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekMsS0FBSztBQUNMLENBQUM7QUFpQ0QsU0FBUyxRQUFRLENBQUMsT0FBTyxFQUFFO0FBQzNCLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBQ0QsU0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFO0FBQ3JELElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM5QyxRQUFRLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDcEMsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsWUFBWSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDOUIsWUFBWSxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUMvQyxnQkFBZ0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELGdCQUFnQixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNqRCxvQkFBb0IsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYixZQUFZLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3BELGdCQUFnQixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELGFBQWE7QUFDYixZQUFZLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsU0FBUztBQUNULEtBQUs7QUFDTCxJQUFJLE9BQU8sR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUNELFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDakMsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzlDLFFBQVEsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRTtBQUNqQyxZQUFZLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNsQyxZQUFZLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsU0FBUztBQUNULEtBQUs7QUFDTCxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUU7QUFDNUIsSUFBSSxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQWlCRCxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7QUFDaEQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsR0FBRyxXQUFXLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDckUsQ0FBQztBQTZFRCxTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM3QyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBQ0QsU0FBUyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNwQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbEQsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xELElBQUksT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDO0FBQ0QsU0FBUyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDOUQsSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUNELE1BQU0sT0FBTyxDQUFDO0FBQ2QsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRTtBQUMvQixRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQ3hCLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMvQixLQUFLO0FBQ0wsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFFO0FBQ25DLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDckIsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUM1QixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsU0FBUztBQUNULFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0wsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQ1osUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDaEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxLQUFLO0FBQ0wsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ2QsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNuRCxZQUFZLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUMsU0FBUztBQUNULEtBQUs7QUFDTCxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUU7QUFDWixRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNqQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0wsSUFBSSxDQUFDLEdBQUc7QUFDUixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLEtBQUs7QUFDTCxDQUFDO0FBbUlEO0FBQ0csSUFBQyxrQkFBa0I7QUFDdEIsU0FBUyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUU7QUFDMUMsSUFBSSxpQkFBaUIsR0FBRyxTQUFTLENBQUM7QUFDbEMsQ0FBQztBQUNELFNBQVMscUJBQXFCLEdBQUc7QUFDakMsSUFBSSxJQUFJLENBQUMsaUJBQWlCO0FBQzFCLFFBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO0FBQzVFLElBQUksT0FBTyxpQkFBaUIsQ0FBQztBQUM3QixDQUFDO0FBQ0QsU0FBUyxZQUFZLENBQUMsRUFBRSxFQUFFO0FBQzFCLElBQUkscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBQ0QsU0FBUyxPQUFPLENBQUMsRUFBRSxFQUFFO0FBQ3JCLElBQUkscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBQ0QsU0FBUyxXQUFXLENBQUMsRUFBRSxFQUFFO0FBQ3pCLElBQUkscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBa0JELFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDbEMsSUFBSSxxQkFBcUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBQ0QsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQ3pCLElBQUksT0FBTyxxQkFBcUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZELENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxTQUFTLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFO0FBQ2xDLElBQUksTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pELElBQUksSUFBSSxTQUFTLEVBQUU7QUFDbkIsUUFBUSxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNuRCxLQUFLO0FBQ0wsQ0FBQztBQUNEO0FBQ0EsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFFdkIsTUFBQyxpQkFBaUIsR0FBRyxHQUFHO0FBQzdCLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzVCLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMzQixNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQyxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUM3QixTQUFTLGVBQWUsR0FBRztBQUMzQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUMzQixRQUFRLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUNoQyxRQUFRLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxLQUFLO0FBQ0wsQ0FBQztBQUtELFNBQVMsbUJBQW1CLENBQUMsRUFBRSxFQUFFO0FBQ2pDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFJRCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDckIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNqQyxTQUFTLEtBQUssR0FBRztBQUNqQixJQUFJLElBQUksUUFBUTtBQUNoQixRQUFRLE9BQU87QUFDZixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDcEIsSUFBSSxHQUFHO0FBQ1A7QUFDQTtBQUNBLFFBQVEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdELFlBQVksTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsWUFBWSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxZQUFZLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakMsU0FBUztBQUNULFFBQVEscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsUUFBUSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLFFBQVEsT0FBTyxpQkFBaUIsQ0FBQyxNQUFNO0FBQ3ZDLFlBQVksaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUN0QztBQUNBO0FBQ0E7QUFDQSxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM3RCxZQUFZLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pELFlBQVksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDL0M7QUFDQSxnQkFBZ0IsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QyxnQkFBZ0IsUUFBUSxFQUFFLENBQUM7QUFDM0IsYUFBYTtBQUNiLFNBQVM7QUFDVCxRQUFRLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDcEMsS0FBSyxRQUFRLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtBQUN0QyxJQUFJLE9BQU8sZUFBZSxDQUFDLE1BQU0sRUFBRTtBQUNuQyxRQUFRLGVBQWUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ2hDLEtBQUs7QUFDTCxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUM3QixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDckIsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUNELFNBQVMsTUFBTSxDQUFDLEVBQUUsRUFBRTtBQUNwQixJQUFJLElBQUksRUFBRSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDOUIsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEIsUUFBUSxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2xDLFFBQVEsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUMvQixRQUFRLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLFFBQVEsRUFBRSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BELFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxLQUFLO0FBQ0wsQ0FBQztBQWVELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IsSUFBSSxNQUFNLENBQUM7QUFDWCxTQUFTLFlBQVksR0FBRztBQUN4QixJQUFJLE1BQU0sR0FBRztBQUNiLFFBQVEsQ0FBQyxFQUFFLENBQUM7QUFDWixRQUFRLENBQUMsRUFBRSxFQUFFO0FBQ2IsUUFBUSxDQUFDLEVBQUUsTUFBTTtBQUNqQixLQUFLLENBQUM7QUFDTixDQUFDO0FBQ0QsU0FBUyxZQUFZLEdBQUc7QUFDeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUNuQixRQUFRLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsS0FBSztBQUNMLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEIsQ0FBQztBQUNELFNBQVMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDckMsSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzFCLFFBQVEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQixRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkIsS0FBSztBQUNMLENBQUM7QUFDRCxTQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDeEQsSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzFCLFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUMvQixZQUFZLE9BQU87QUFDbkIsUUFBUSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFFBQVEsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTTtBQUM1QixZQUFZLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMsWUFBWSxJQUFJLFFBQVEsRUFBRTtBQUMxQixnQkFBZ0IsSUFBSSxNQUFNO0FBQzFCLG9CQUFvQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLGdCQUFnQixRQUFRLEVBQUUsQ0FBQztBQUMzQixhQUFhO0FBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWCxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkIsS0FBSztBQUNMLENBQUM7QUFzU0Q7QUFDQSxNQUFNLE9BQU8sSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXO0FBQzlDLE1BQU0sTUFBTTtBQUNaLE1BQU0sT0FBTyxVQUFVLEtBQUssV0FBVztBQUN2QyxVQUFVLFVBQVU7QUFDcEIsVUFBVSxNQUFNLENBQUMsQ0FBQztBQXdHbEI7QUFDQSxTQUFTLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDNUMsSUFBSSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBSSxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDM0IsSUFBSSxNQUFNLGFBQWEsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN6QyxJQUFJLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDMUIsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFO0FBQ2hCLFFBQVEsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQVEsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFDZixZQUFZLEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFO0FBQ2pDLGdCQUFnQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMvQixvQkFBb0IsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QyxhQUFhO0FBQ2IsWUFBWSxLQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRTtBQUNqQyxnQkFBZ0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN6QyxvQkFBb0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QyxvQkFBb0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQyxpQkFBaUI7QUFDakIsYUFBYTtBQUNiLFlBQVksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixTQUFTO0FBQ1QsYUFBYTtBQUNiLFlBQVksS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUU7QUFDakMsZ0JBQWdCLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsYUFBYTtBQUNiLFNBQVM7QUFDVCxLQUFLO0FBQ0wsSUFBSSxLQUFLLE1BQU0sR0FBRyxJQUFJLFdBQVcsRUFBRTtBQUNuQyxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDO0FBQzVCLFlBQVksTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNwQyxLQUFLO0FBQ0wsSUFBSSxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBQ0QsU0FBUyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUU7QUFDekMsSUFBSSxPQUFPLE9BQU8sWUFBWSxLQUFLLFFBQVEsSUFBSSxZQUFZLEtBQUssSUFBSSxHQUFHLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDekYsQ0FBQztBQWlKRCxTQUFTLGdCQUFnQixDQUFDLEtBQUssRUFBRTtBQUNqQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDdkIsQ0FBQztBQUNELFNBQVMsZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUU7QUFDOUMsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBQ0QsU0FBUyxlQUFlLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDcEQsSUFBSSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztBQUMxRSxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzQztBQUNBLElBQUksbUJBQW1CLENBQUMsTUFBTTtBQUM5QixRQUFRLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JFLFFBQVEsSUFBSSxVQUFVLEVBQUU7QUFDeEIsWUFBWSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7QUFDL0MsU0FBUztBQUNULGFBQWE7QUFDYjtBQUNBO0FBQ0EsWUFBWSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsU0FBUztBQUNULFFBQVEsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25DLEtBQUssQ0FBQyxDQUFDO0FBQ1AsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUNELFNBQVMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUNqRCxJQUFJLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7QUFDNUIsSUFBSSxJQUFJLEVBQUUsQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO0FBQzlCLFFBQVEsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQixRQUFRLEVBQUUsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEQ7QUFDQTtBQUNBLFFBQVEsRUFBRSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUMzQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLEtBQUs7QUFDTCxDQUFDO0FBQ0QsU0FBUyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtBQUNsQyxJQUFJLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDdEMsUUFBUSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekMsUUFBUSxlQUFlLEVBQUUsQ0FBQztBQUMxQixRQUFRLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxLQUFLO0FBQ0wsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFDRCxTQUFTLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzdGLElBQUksTUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztBQUMvQyxJQUFJLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7QUFDNUMsSUFBSSxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsRUFBRSxHQUFHO0FBQzlCLFFBQVEsUUFBUSxFQUFFLElBQUk7QUFDdEIsUUFBUSxHQUFHLEVBQUUsSUFBSTtBQUNqQjtBQUNBLFFBQVEsS0FBSztBQUNiLFFBQVEsTUFBTSxFQUFFLElBQUk7QUFDcEIsUUFBUSxTQUFTO0FBQ2pCLFFBQVEsS0FBSyxFQUFFLFlBQVksRUFBRTtBQUM3QjtBQUNBLFFBQVEsUUFBUSxFQUFFLEVBQUU7QUFDcEIsUUFBUSxVQUFVLEVBQUUsRUFBRTtBQUN0QixRQUFRLGFBQWEsRUFBRSxFQUFFO0FBQ3pCLFFBQVEsWUFBWSxFQUFFLEVBQUU7QUFDeEIsUUFBUSxPQUFPLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDN0U7QUFDQSxRQUFRLFNBQVMsRUFBRSxZQUFZLEVBQUU7QUFDakMsUUFBUSxLQUFLO0FBQ2IsUUFBUSxVQUFVLEVBQUUsS0FBSztBQUN6QixLQUFLLENBQUM7QUFDTixJQUFJLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztBQUN0QixJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQUcsUUFBUTtBQUNyQixVQUFVLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSztBQUNoRSxZQUFZLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0RCxZQUFZLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO0FBQ25FLGdCQUFnQixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqRCxvQkFBb0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QyxnQkFBZ0IsSUFBSSxLQUFLO0FBQ3pCLG9CQUFvQixVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdDLGFBQWE7QUFDYixZQUFZLE9BQU8sR0FBRyxDQUFDO0FBQ3ZCLFNBQVMsQ0FBQztBQUNWLFVBQVUsRUFBRSxDQUFDO0FBQ2IsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDaEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM5QjtBQUNBLElBQUksRUFBRSxDQUFDLFFBQVEsR0FBRyxlQUFlLEdBQUcsZUFBZSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDcEUsSUFBSSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDeEIsUUFBUSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDN0IsWUFBWSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25EO0FBQ0EsWUFBWSxFQUFFLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFlBQVksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxTQUFTO0FBQ1QsYUFBYTtBQUNiO0FBQ0EsWUFBWSxFQUFFLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDM0MsU0FBUztBQUNULFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSztBQUN6QixZQUFZLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pELFFBQVEsZUFBZSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRSxRQUFRLEtBQUssRUFBRSxDQUFDO0FBQ2hCLEtBQUs7QUFDTCxJQUFJLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDNUMsQ0FBQztBQXlDRCxNQUFNLGVBQWUsQ0FBQztBQUN0QixJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDN0IsS0FBSztBQUNMLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDeEIsUUFBUSxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RGLFFBQVEsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxRQUFRLE9BQU8sTUFBTTtBQUNyQixZQUFZLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEQsWUFBWSxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUM7QUFDNUIsZ0JBQWdCLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFNBQVMsQ0FBQztBQUNWLEtBQUs7QUFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDbEIsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDOUMsWUFBWSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdEMsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hDLFlBQVksSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3ZDLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNEO0FBQ0EsU0FBUyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNwQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RixDQUFDO0FBQ0QsU0FBUyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUNsQyxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3RELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBQ0QsU0FBUyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDMUMsSUFBSSxZQUFZLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDOUQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBQ0QsU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFO0FBQzFCLElBQUksWUFBWSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5QyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBZ0JELFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRTtBQUM5RixJQUFJLE1BQU0sU0FBUyxHQUFHLE9BQU8sS0FBSyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZHLElBQUksSUFBSSxtQkFBbUI7QUFDM0IsUUFBUSxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDekMsSUFBSSxJQUFJLG9CQUFvQjtBQUM1QixRQUFRLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMxQyxJQUFJLFlBQVksQ0FBQywyQkFBMkIsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDbkYsSUFBSSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDMUQsSUFBSSxPQUFPLE1BQU07QUFDakIsUUFBUSxZQUFZLENBQUMsOEJBQThCLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQzFGLFFBQVEsT0FBTyxFQUFFLENBQUM7QUFDbEIsS0FBSyxDQUFDO0FBQ04sQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO0FBQzFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJO0FBQ3JCLFFBQVEsWUFBWSxDQUFDLDBCQUEwQixFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDdEU7QUFDQSxRQUFRLFlBQVksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBU0QsU0FBUyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUNsQyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUk7QUFDL0IsUUFBUSxPQUFPO0FBQ2YsSUFBSSxZQUFZLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0QsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNyQixDQUFDO0FBQ0QsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7QUFDckMsSUFBSSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksUUFBUSxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ3pGLFFBQVEsSUFBSSxHQUFHLEdBQUcsZ0RBQWdELENBQUM7QUFDbkUsUUFBUSxJQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0UsWUFBWSxHQUFHLElBQUksK0RBQStELENBQUM7QUFDbkYsU0FBUztBQUNULFFBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixLQUFLO0FBQ0wsQ0FBQztBQUNELFNBQVMsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQzFDLElBQUksS0FBSyxNQUFNLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzlDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN0QyxZQUFZLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLCtCQUErQixFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQztBQUNELE1BQU0sa0JBQWtCLFNBQVMsZUFBZSxDQUFDO0FBQ2pELElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtBQUN6QixRQUFRLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2hFLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQzdELFNBQVM7QUFDVCxRQUFRLEtBQUssRUFBRSxDQUFDO0FBQ2hCLEtBQUs7QUFDTCxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3pCLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNO0FBQzlCLFlBQVksT0FBTyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQzVELFNBQVMsQ0FBQztBQUNWLEtBQUs7QUFDTCxJQUFJLGNBQWMsR0FBRyxHQUFHO0FBQ3hCLElBQUksYUFBYSxHQUFHLEdBQUc7QUFDdkI7O0FDcG1EQSxNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztBQVc1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxJQUFJLEVBQUU7QUFDdkMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUNiLElBQUksTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQzNCLElBQUksU0FBUyxHQUFHLENBQUMsU0FBUyxFQUFFO0FBQzVCLFFBQVEsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0FBQzlDLFlBQVksS0FBSyxHQUFHLFNBQVMsQ0FBQztBQUM5QixZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3RCLGdCQUFnQixNQUFNLFNBQVMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztBQUMzRCxnQkFBZ0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoRSxvQkFBb0IsTUFBTSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMzQixvQkFBb0IsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwRCxpQkFBaUI7QUFDakIsZ0JBQWdCLElBQUksU0FBUyxFQUFFO0FBQy9CLG9CQUFvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDekUsd0JBQXdCLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLHFCQUFxQjtBQUNyQixvQkFBb0IsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoRCxpQkFBaUI7QUFDakIsYUFBYTtBQUNiLFNBQVM7QUFDVCxLQUFLO0FBQ0wsSUFBSSxTQUFTLE1BQU0sQ0FBQyxFQUFFLEVBQUU7QUFDeEIsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDdkIsS0FBSztBQUNMLElBQUksU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLFVBQVUsR0FBRyxJQUFJLEVBQUU7QUFDL0MsUUFBUSxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM3QyxRQUFRLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3RDLFlBQVksSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDdEMsU0FBUztBQUNULFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25CLFFBQVEsT0FBTyxNQUFNO0FBQ3JCLFlBQVksTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxRCxZQUFZLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzlCLGdCQUFnQixXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxhQUFhO0FBQ2IsWUFBWSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztBQUN2QixnQkFBZ0IsSUFBSSxHQUFHLElBQUksQ0FBQztBQUM1QixhQUFhO0FBQ2IsU0FBUyxDQUFDO0FBQ1YsS0FBSztBQUNMLElBQUksT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDdEM7O0FDN0RPLE1BQU0sV0FBVyxHQUFHLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dCQzBDdEIsR0FBSyxRQUFLLEdBQUc7Z0JBTVIsR0FBSyxRQUFLLEdBQUc7Ozs7Ozs7Z0NBWlgsR0FBUztrQkFDakIsR0FBVzs7c0NBQ1IsR0FBSyxjQUFJLEdBQUUsZ0JBQUksR0FBSTs7O3lDQUNsQixHQUFNLGNBQUksR0FBRSxnQkFBSSxHQUFJOzs7OzZEQUVOLEdBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4REFMbkIsR0FBUzttREFDakIsR0FBVztpRkFDUixHQUFLLGNBQUksR0FBRSxnQkFBSSxHQUFJO3NGQUNsQixHQUFNLGNBQUksR0FBRSxnQkFBSSxHQUFJOzt1R0FFTixHQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F6Q3BCLEtBQUssR0FBRyxHQUFHO09BQ1gsU0FBUyxHQUFHLEVBQUU7T0FDZCxLQUFLLEdBQUcsRUFBRTtPQUNWLE1BQU0sR0FBRyxFQUFFO09BQ1gsU0FBUyxHQUFHLGFBQWE7S0FDaEMsSUFBSTtLQUNKLEVBQUU7S0FDRixFQUFFO0tBRUYsSUFBSSxHQUFHLEVBQUU7O0NBQ2IsT0FBTztNQUNELElBQUk7bUJBQ04sRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLO21CQUN2QyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLE1BQU07Ozs7Q0FJNUMsV0FBVztNQUNMLElBQUk7bUJBQ04sRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLO21CQUN2QyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLE1BQU07OztPQUVyQyxLQUFLLElBQUksS0FBSyxJQUFJLEdBQUc7T0FDcEIsYUFBYSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVM7O09BQzlELGFBQWEsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLGlCQUFpQixNQUFNLENBQUM7b0JBQ2pFLEtBQUssR0FBRyxHQUFHOztvQkFFWCxLQUFLLEdBQUcsR0FBRzs7Ozs7OztHQWlCRixJQUFJOzs7Ozs7O0dBTUosSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0JDUmQsR0FBSyxRQUFLLEdBQUc7Z0JBS1IsR0FBSyxRQUFLLEdBQUc7Ozs7Ozs7Z0NBWFgsR0FBUztrQkFDakIsR0FBVzs7c0NBQ1IsR0FBSyxjQUFJLEdBQUUsZ0JBQUksR0FBSTs7O3lDQUNsQixHQUFNLGNBQUksR0FBRSxnQkFBSSxHQUFJOzs7OzZEQUVOLEdBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4REFMbkIsR0FBUzttREFDakIsR0FBVztpRkFDUixHQUFLLGNBQUksR0FBRSxnQkFBSSxHQUFJO3NGQUNsQixHQUFNLGNBQUksR0FBRSxnQkFBSSxHQUFJOzt1R0FFTixHQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F6Q3BCLEtBQUssR0FBRyxHQUFHO09BQ1gsU0FBUyxHQUFHLEVBQUU7T0FDZCxLQUFLLEdBQUcsRUFBRTtPQUNWLE1BQU0sR0FBRyxFQUFFO09BQ1gsU0FBUyxHQUFHLGlCQUFpQjtLQUNwQyxJQUFJO0tBQ0osRUFBRTtLQUNGLEVBQUU7S0FFRixJQUFJLEdBQUcsRUFBRTs7Q0FDYixPQUFPO01BQ0QsSUFBSTttQkFDTixFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUs7bUJBQ3ZDLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsTUFBTTs7OztDQUk1QyxXQUFXO01BQ0wsSUFBSTttQkFDTixFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUs7bUJBQ3ZDLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsTUFBTTs7O09BRXJDLEtBQUssSUFBSSxLQUFLLElBQUksR0FBRztPQUNwQixhQUFhLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUzs7T0FDOUQsYUFBYSxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLE1BQU0sQ0FBQztvQkFDakUsS0FBSyxHQUFHLEdBQUc7O29CQUVYLEtBQUssR0FBRyxHQUFHOzs7Ozs7O0dBaUJGLElBQUk7Ozs7Ozs7R0FLSixJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkNQZCxHQUFLLFFBQUssR0FBRztnQkFNUixHQUFLLFFBQUssR0FBRzs7Ozs7OztnQ0FaWCxHQUFTO2tCQUNqQixHQUFXOztzQ0FDUixHQUFLLGNBQUksR0FBRSxnQkFBSSxHQUFJOzs7eUNBQ2xCLEdBQU0sY0FBSSxHQUFFLGdCQUFJLEdBQUk7Ozs7NkRBRU4sR0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzhEQUxuQixHQUFTO21EQUNqQixHQUFXO2lGQUNSLEdBQUssY0FBSSxHQUFFLGdCQUFJLEdBQUk7c0ZBQ2xCLEdBQU0sY0FBSSxHQUFFLGdCQUFJLEdBQUk7O3VHQUVOLEdBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXpDcEIsS0FBSyxHQUFHLEdBQUc7T0FDWCxTQUFTLEdBQUcsRUFBRTtPQUNkLEtBQUssR0FBRyxFQUFFO09BQ1YsTUFBTSxHQUFHLEVBQUU7T0FDWCxTQUFTLEdBQUcsbUJBQW1CO0tBQ3RDLElBQUk7S0FDSixFQUFFO0tBQ0YsRUFBRTtLQUVGLElBQUksR0FBRyxFQUFFOztDQUNiLE9BQU87TUFDRCxJQUFJO21CQUNOLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSzttQkFDdkMsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxNQUFNOzs7O0NBSTVDLFdBQVc7TUFDTCxJQUFJO21CQUNOLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSzttQkFDdkMsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxNQUFNOzs7T0FFckMsS0FBSyxJQUFJLEtBQUssSUFBSSxHQUFHO09BQ3BCLGFBQWEsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTOztPQUM5RCxhQUFhLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsTUFBTSxDQUFDO29CQUNqRSxLQUFLLEdBQUcsR0FBRzs7b0JBRVgsS0FBSyxHQUFHLEdBQUc7Ozs7Ozs7R0FpQkYsSUFBSTs7Ozs7OztHQU1KLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dCQ1JkLEdBQUssUUFBSyxHQUFHO2dCQU1SLEdBQUssUUFBSyxHQUFHOzs7Ozs7O2dDQVpYLEdBQVM7a0JBQ2pCLEdBQVc7O3NDQUNSLEdBQUssY0FBSSxHQUFFLGdCQUFJLEdBQUk7Ozt5Q0FDbEIsR0FBTSxjQUFJLEdBQUUsZ0JBQUksR0FBSTs7Ozs2REFFTixHQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OERBTG5CLEdBQVM7bURBQ2pCLEdBQVc7aUZBQ1IsR0FBSyxjQUFJLEdBQUUsZ0JBQUksR0FBSTtzRkFDbEIsR0FBTSxjQUFJLEdBQUUsZ0JBQUksR0FBSTs7dUdBRU4sR0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BekNwQixLQUFLLEdBQUcsR0FBRztPQUNYLFNBQVMsR0FBRyxFQUFFO09BQ2QsS0FBSyxHQUFHLEVBQUU7T0FDVixNQUFNLEdBQUcsRUFBRTtPQUNYLFNBQVMsR0FBRyxvQkFBb0I7S0FDdkMsSUFBSTtLQUNKLEVBQUU7S0FDRixFQUFFO0tBRUYsSUFBSSxHQUFHLEVBQUU7O0NBQ2IsT0FBTztNQUNELElBQUk7bUJBQ04sRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLO21CQUN2QyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLE1BQU07Ozs7Q0FJNUMsV0FBVztNQUNMLElBQUk7bUJBQ04sRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLO21CQUN2QyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLE1BQU07OztPQUVyQyxLQUFLLElBQUksS0FBSyxJQUFJLEdBQUc7T0FDcEIsYUFBYSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVM7O09BQzlELGFBQWEsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLGlCQUFpQixNQUFNLENBQUM7b0JBQ2pFLEtBQUssR0FBRyxHQUFHOztvQkFFWCxLQUFLLEdBQUcsR0FBRzs7Ozs7OztHQWlCRixJQUFJOzs7Ozs7O0dBTUosSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNwRHJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUFPLEdBQUcsQ0FBQyxZQUFZO0FBQzNCLElBQUksSUFBSSxPQUFPLEdBQUcsS0FBSyxXQUFXLEVBQUU7QUFDcEMsUUFBUSxPQUFPLEdBQUcsQ0FBQztBQUNuQixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDaEMsUUFBUSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QixRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ3pDLFlBQVksSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ2xDLGdCQUFnQixNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQy9CLGdCQUFnQixPQUFPLElBQUksQ0FBQztBQUM1QixhQUFhO0FBQ2IsWUFBWSxPQUFPLEtBQUssQ0FBQztBQUN6QixTQUFTLENBQUMsQ0FBQztBQUNYLFFBQVEsT0FBTyxNQUFNLENBQUM7QUFDdEIsS0FBSztBQUNMLElBQUksc0JBQXNCLFlBQVk7QUFDdEMsUUFBUSxTQUFTLE9BQU8sR0FBRztBQUMzQixZQUFZLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ2xDLFNBQVM7QUFDVCxRQUFRLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDekQ7QUFDQTtBQUNBO0FBQ0EsWUFBWSxHQUFHLEVBQUUsWUFBWTtBQUM3QixnQkFBZ0IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztBQUMvQyxhQUFhO0FBQ2IsWUFBWSxVQUFVLEVBQUUsSUFBSTtBQUM1QixZQUFZLFlBQVksRUFBRSxJQUFJO0FBQzlCLFNBQVMsQ0FBQyxDQUFDO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQy9DLFlBQVksSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDeEQsWUFBWSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFlBQVksT0FBTyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLFNBQVMsQ0FBQztBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUN0RCxZQUFZLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3hELFlBQVksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUN4QixnQkFBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDbkQsYUFBYTtBQUNiLGlCQUFpQjtBQUNqQixnQkFBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNwRCxhQUFhO0FBQ2IsU0FBUyxDQUFDO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQ2xELFlBQVksSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUMzQyxZQUFZLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0MsWUFBWSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ3hCLGdCQUFnQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QyxhQUFhO0FBQ2IsU0FBUyxDQUFDO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQy9DLFlBQVksT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0RCxTQUFTLENBQUM7QUFDVjtBQUNBO0FBQ0E7QUFDQSxRQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVk7QUFDOUMsWUFBWSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxTQUFTLENBQUM7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLFFBQVEsRUFBRSxHQUFHLEVBQUU7QUFDN0QsWUFBWSxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRTtBQUMvQyxZQUFZLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQzFFLGdCQUFnQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkMsZ0JBQWdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RCxhQUFhO0FBQ2IsU0FBUyxDQUFDO0FBQ1YsUUFBUSxPQUFPLE9BQU8sQ0FBQztBQUN2QixLQUFLLEVBQUUsRUFBRTtBQUNULENBQUMsR0FBRyxDQUFDO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFNBQVMsR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQ2pIO0FBQ0E7QUFDQSxJQUFJLFFBQVEsR0FBRyxDQUFDLFlBQVk7QUFDNUIsSUFBSSxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUMvRCxRQUFRLE9BQU8sTUFBTSxDQUFDO0FBQ3RCLEtBQUs7QUFDTCxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO0FBQzNELFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMLElBQUksSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7QUFDL0QsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUN0QixLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7QUFDckMsQ0FBQyxHQUFHLENBQUM7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksdUJBQXVCLEdBQUcsQ0FBQyxZQUFZO0FBQzNDLElBQUksSUFBSSxPQUFPLHFCQUFxQixLQUFLLFVBQVUsRUFBRTtBQUNyRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BELEtBQUs7QUFDTCxJQUFJLE9BQU8sVUFBVSxRQUFRLEVBQUUsRUFBRSxPQUFPLFVBQVUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDL0csQ0FBQyxHQUFHLENBQUM7QUFDTDtBQUNBO0FBQ0EsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQ3BDLElBQUksSUFBSSxXQUFXLEdBQUcsS0FBSyxFQUFFLFlBQVksR0FBRyxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQztBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFNBQVMsY0FBYyxHQUFHO0FBQzlCLFFBQVEsSUFBSSxXQUFXLEVBQUU7QUFDekIsWUFBWSxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ2hDLFlBQVksUUFBUSxFQUFFLENBQUM7QUFDdkIsU0FBUztBQUNULFFBQVEsSUFBSSxZQUFZLEVBQUU7QUFDMUIsWUFBWSxLQUFLLEVBQUUsQ0FBQztBQUNwQixTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLGVBQWUsR0FBRztBQUMvQixRQUFRLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2hELEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLEtBQUssR0FBRztBQUNyQixRQUFRLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuQyxRQUFRLElBQUksV0FBVyxFQUFFO0FBQ3pCO0FBQ0EsWUFBWSxJQUFJLFNBQVMsR0FBRyxZQUFZLEdBQUcsZUFBZSxFQUFFO0FBQzVELGdCQUFnQixPQUFPO0FBQ3ZCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksWUFBWSxHQUFHLElBQUksQ0FBQztBQUNoQyxTQUFTO0FBQ1QsYUFBYTtBQUNiLFlBQVksV0FBVyxHQUFHLElBQUksQ0FBQztBQUMvQixZQUFZLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDakMsWUFBWSxVQUFVLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9DLFNBQVM7QUFDVCxRQUFRLFlBQVksR0FBRyxTQUFTLENBQUM7QUFDakMsS0FBSztBQUNMLElBQUksT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQUNEO0FBQ0E7QUFDQSxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDdkI7QUFDQTtBQUNBLElBQUksY0FBYyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdGO0FBQ0EsSUFBSSx5QkFBeUIsR0FBRyxPQUFPLGdCQUFnQixLQUFLLFdBQVcsQ0FBQztBQUN4RTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHdCQUF3QixrQkFBa0IsWUFBWTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLHdCQUF3QixHQUFHO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFRLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pFLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDeEUsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksd0JBQXdCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLFFBQVEsRUFBRTtBQUN6RSxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2pELFlBQVksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUM5QixZQUFZLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM1QixTQUFTO0FBQ1QsS0FBSyxDQUFDO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQzVFLFFBQVEsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUN4QyxRQUFRLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDcEIsWUFBWSxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbEQsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDL0IsU0FBUztBQUNULEtBQUssQ0FBQztBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksd0JBQXdCLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFZO0FBQzdELFFBQVEsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDdEQ7QUFDQTtBQUNBLFFBQVEsSUFBSSxlQUFlLEVBQUU7QUFDN0IsWUFBWSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDM0IsU0FBUztBQUNULEtBQUssQ0FBQztBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZO0FBQ3RFO0FBQ0EsUUFBUSxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUN6RSxZQUFZLE9BQU8sUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqRSxTQUFTLENBQUMsQ0FBQztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBVSxRQUFRLEVBQUUsRUFBRSxPQUFPLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1RixRQUFRLE9BQU8sZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDMUMsS0FBSyxDQUFDO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFlBQVk7QUFDOUQ7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQzNDLFlBQVksT0FBTztBQUNuQixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzFFLFFBQVEsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEQsUUFBUSxJQUFJLHlCQUF5QixFQUFFO0FBQ3ZDLFlBQVksSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pFLFlBQVksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFDdEQsZ0JBQWdCLFVBQVUsRUFBRSxJQUFJO0FBQ2hDLGdCQUFnQixTQUFTLEVBQUUsSUFBSTtBQUMvQixnQkFBZ0IsYUFBYSxFQUFFLElBQUk7QUFDbkMsZ0JBQWdCLE9BQU8sRUFBRSxJQUFJO0FBQzdCLGFBQWEsQ0FBQyxDQUFDO0FBQ2YsU0FBUztBQUNULGFBQWE7QUFDYixZQUFZLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUUsWUFBWSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0FBQzdDLFNBQVM7QUFDVCxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQy9CLEtBQUssQ0FBQztBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksd0JBQXdCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFZO0FBQ2pFO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQzVDLFlBQVksT0FBTztBQUNuQixTQUFTO0FBQ1QsUUFBUSxRQUFRLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzdFLFFBQVEsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0QsUUFBUSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtBQUNyQyxZQUFZLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNqRCxTQUFTO0FBQ1QsUUFBUSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtBQUN2QyxZQUFZLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0UsU0FBUztBQUNULFFBQVEsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztBQUN2QyxRQUFRLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7QUFDMUMsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUNoQyxLQUFLLENBQUM7QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksd0JBQXdCLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsRUFBRSxFQUFFO0FBQ3hFLFFBQVEsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLEdBQUcsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDekU7QUFDQSxRQUFRLElBQUksZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUNsRSxZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoRCxTQUFTLENBQUMsQ0FBQztBQUNYLFFBQVEsSUFBSSxnQkFBZ0IsRUFBRTtBQUM5QixZQUFZLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQixTQUFTO0FBQ1QsS0FBSyxDQUFDO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksd0JBQXdCLENBQUMsV0FBVyxHQUFHLFlBQVk7QUFDdkQsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUM3QixZQUFZLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO0FBQzVELFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUM5QixLQUFLLENBQUM7QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQzlDLElBQUksT0FBTyx3QkFBd0IsQ0FBQztBQUNwQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksa0JBQWtCLElBQUksVUFBVSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQ25ELElBQUksS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDcEUsUUFBUSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekIsUUFBUSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7QUFDM0MsWUFBWSxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUM3QixZQUFZLFVBQVUsRUFBRSxLQUFLO0FBQzdCLFlBQVksUUFBUSxFQUFFLEtBQUs7QUFDM0IsWUFBWSxZQUFZLEVBQUUsSUFBSTtBQUM5QixTQUFTLENBQUMsQ0FBQztBQUNYLEtBQUs7QUFDTCxJQUFJLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFdBQVcsSUFBSSxVQUFVLE1BQU0sRUFBRTtBQUNyQztBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUksV0FBVyxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsYUFBYSxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO0FBQ3pGO0FBQ0E7QUFDQSxJQUFJLE9BQU8sV0FBVyxJQUFJLFFBQVEsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQztBQUNIO0FBQ0E7QUFDQSxJQUFJLFNBQVMsR0FBRyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ3hCLElBQUksT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUNoQyxJQUFJLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUN2QixJQUFJLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ2xELFFBQVEsU0FBUyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUMsS0FBSztBQUNMLElBQUksT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRTtBQUN0RCxRQUFRLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDO0FBQzVELFFBQVEsT0FBTyxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNWLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7QUFDN0IsSUFBSSxJQUFJLFNBQVMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZELElBQUksSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLElBQUksS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLFNBQVMsRUFBRSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUM3RSxRQUFRLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN2QyxRQUFRLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLENBQUM7QUFDbEQsUUFBUSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLEtBQUs7QUFDTCxJQUFJLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsaUJBQWlCLENBQUMsTUFBTSxFQUFFO0FBQ25DLElBQUksSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2hDLElBQUksT0FBTyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUU7QUFDM0M7QUFDQTtBQUNBLElBQUksSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3ZDLFFBQVEsT0FBTyxTQUFTLENBQUM7QUFDekIsS0FBSztBQUNMLElBQUksSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlELElBQUksSUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLElBQUksSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBQ2xELElBQUksSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZFO0FBQ0E7QUFDQSxJQUFJLElBQUksTUFBTSxDQUFDLFNBQVMsS0FBSyxZQUFZLEVBQUU7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLFdBQVcsRUFBRTtBQUMxRCxZQUFZLEtBQUssSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDeEUsU0FBUztBQUNULFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxZQUFZLEVBQUU7QUFDM0QsWUFBWSxNQUFNLElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ3hFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQ3ZFLFFBQVEsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsWUFBWSxDQUFDO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDM0MsWUFBWSxLQUFLLElBQUksYUFBYSxDQUFDO0FBQ25DLFNBQVM7QUFDVCxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDNUMsWUFBWSxNQUFNLElBQUksY0FBYyxDQUFDO0FBQ3JDLFNBQVM7QUFDVCxLQUFLO0FBQ0wsSUFBSSxPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RFLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLG9CQUFvQixHQUFHLENBQUMsWUFBWTtBQUN4QztBQUNBO0FBQ0EsSUFBSSxJQUFJLE9BQU8sa0JBQWtCLEtBQUssV0FBVyxFQUFFO0FBQ25ELFFBQVEsT0FBTyxVQUFVLE1BQU0sRUFBRSxFQUFFLE9BQU8sTUFBTSxZQUFZLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7QUFDdEcsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLElBQUksT0FBTyxVQUFVLE1BQU0sRUFBRSxFQUFFLFFBQVEsTUFBTSxZQUFZLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVO0FBQ3ZGLFFBQVEsT0FBTyxNQUFNLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRSxFQUFFLENBQUM7QUFDakQsQ0FBQyxHQUFHLENBQUM7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtBQUNuQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO0FBQ25FLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDaEMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ3BCLFFBQVEsT0FBTyxTQUFTLENBQUM7QUFDekIsS0FBSztBQUNMLElBQUksSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUN0QyxRQUFRLE9BQU8saUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekMsS0FBSztBQUNMLElBQUksT0FBTyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLGtCQUFrQixDQUFDLEVBQUUsRUFBRTtBQUNoQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDakU7QUFDQSxJQUFJLElBQUksTUFBTSxHQUFHLE9BQU8sZUFBZSxLQUFLLFdBQVcsR0FBRyxlQUFlLEdBQUcsTUFBTSxDQUFDO0FBQ25GLElBQUksSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0M7QUFDQSxJQUFJLGtCQUFrQixDQUFDLElBQUksRUFBRTtBQUM3QixRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNO0FBQ2hELFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDZCxRQUFRLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBSztBQUN4QixRQUFRLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQztBQUMxQixRQUFRLElBQUksRUFBRSxDQUFDO0FBQ2YsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUM3QyxJQUFJLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDeEQsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQixrQkFBa0IsWUFBWTtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2RCxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzdCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBWTtBQUN2RCxRQUFRLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0MsUUFBUSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUNqQyxRQUFRLFFBQVEsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsY0FBYztBQUNsRCxZQUFZLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNsRCxLQUFLLENBQUM7QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsWUFBWTtBQUM1RCxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDckMsUUFBUSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekMsUUFBUSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0MsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLLENBQUM7QUFDTixJQUFJLE9BQU8saUJBQWlCLENBQUM7QUFDN0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNMO0FBQ0EsSUFBSSxtQkFBbUIsa0JBQWtCLFlBQVk7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDbkQsUUFBUSxJQUFJLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLGtCQUFrQixDQUFDLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDL0UsS0FBSztBQUNMLElBQUksT0FBTyxtQkFBbUIsQ0FBQztBQUMvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ0w7QUFDQSxJQUFJLGlCQUFpQixrQkFBa0IsWUFBWTtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksU0FBUyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRTtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQzNDLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDNUMsWUFBWSxNQUFNLElBQUksU0FBUyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7QUFDM0YsU0FBUztBQUNULFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDbEMsUUFBUSxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUN0QyxRQUFRLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBQ3hDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDNUQsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtBQUMvQixZQUFZLE1BQU0sSUFBSSxTQUFTLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUM1RSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxJQUFJLEVBQUUsT0FBTyxZQUFZLE1BQU0sQ0FBQyxFQUFFO0FBQzVFLFlBQVksT0FBTztBQUNuQixTQUFTO0FBQ1QsUUFBUSxJQUFJLEVBQUUsTUFBTSxZQUFZLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUM5RCxZQUFZLE1BQU0sSUFBSSxTQUFTLENBQUMsdUNBQXVDLENBQUMsQ0FBQztBQUN6RSxTQUFTO0FBQ1QsUUFBUSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQzlDO0FBQ0EsUUFBUSxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDdEMsWUFBWSxPQUFPO0FBQ25CLFNBQVM7QUFDVCxRQUFRLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNoRSxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsUUFBUSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25DLEtBQUssQ0FBQztBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLE1BQU0sRUFBRTtBQUM5RCxRQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQy9CLFlBQVksTUFBTSxJQUFJLFNBQVMsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQzVFLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXLElBQUksRUFBRSxPQUFPLFlBQVksTUFBTSxDQUFDLEVBQUU7QUFDNUUsWUFBWSxPQUFPO0FBQ25CLFNBQVM7QUFDVCxRQUFRLElBQUksRUFBRSxNQUFNLFlBQVksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzlELFlBQVksTUFBTSxJQUFJLFNBQVMsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQ3pFLFNBQVM7QUFDVCxRQUFRLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDOUM7QUFDQSxRQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3ZDLFlBQVksT0FBTztBQUNuQixTQUFTO0FBQ1QsUUFBUSxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUU7QUFDaEMsWUFBWSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxTQUFTO0FBQ1QsS0FBSyxDQUFDO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFZO0FBQ3pELFFBQVEsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlDLEtBQUssQ0FBQztBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxZQUFZO0FBQzNELFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFFBQVEsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxXQUFXLEVBQUU7QUFDMUQsWUFBWSxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUN4QyxnQkFBZ0IsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM1RCxhQUFhO0FBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWCxLQUFLLENBQUM7QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsWUFBWTtBQUM5RDtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUMvQixZQUFZLE9BQU87QUFDbkIsU0FBUztBQUNULFFBQVEsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNwQztBQUNBLFFBQVEsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFVLFdBQVcsRUFBRTtBQUMxRSxZQUFZLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQzVGLFNBQVMsQ0FBQyxDQUFDO0FBQ1gsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQy9DLFFBQVEsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCLEtBQUssQ0FBQztBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBWTtBQUMxRCxRQUFRLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsS0FBSyxDQUFDO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxZQUFZO0FBQ3hELFFBQVEsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNuRCxLQUFLLENBQUM7QUFDTixJQUFJLE9BQU8saUJBQWlCLENBQUM7QUFDN0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLEdBQUcsT0FBTyxPQUFPLEtBQUssV0FBVyxHQUFHLElBQUksT0FBTyxFQUFFLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksY0FBYyxrQkFBa0IsWUFBWTtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFNBQVMsY0FBYyxDQUFDLFFBQVEsRUFBRTtBQUN0QyxRQUFRLElBQUksRUFBRSxJQUFJLFlBQVksY0FBYyxDQUFDLEVBQUU7QUFDL0MsWUFBWSxNQUFNLElBQUksU0FBUyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDdEUsU0FBUztBQUNULFFBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDL0IsWUFBWSxNQUFNLElBQUksU0FBUyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDNUUsU0FBUztBQUNULFFBQVEsSUFBSSxVQUFVLEdBQUcsd0JBQXdCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDaEUsUUFBUSxJQUFJLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekUsUUFBUSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN0QyxLQUFLO0FBQ0wsSUFBSSxPQUFPLGNBQWMsQ0FBQztBQUMxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ0w7QUFDQTtBQUNBLElBQUksU0FBUztBQUNiLElBQUksV0FBVztBQUNmLElBQUksWUFBWTtBQUNoQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFO0FBQzVCLElBQUksY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZO0FBQ25ELFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDZixRQUFRLE9BQU8sQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZFLEtBQUssQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBQ0g7QUFDQSxJQUFJLEtBQUssR0FBRyxDQUFDLFlBQVk7QUFDekI7QUFDQSxJQUFJLElBQUksT0FBTyxRQUFRLENBQUMsY0FBYyxLQUFLLFdBQVcsRUFBRTtBQUN4RCxRQUFRLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQztBQUN2QyxLQUFLO0FBQ0wsSUFBSSxPQUFPLGNBQWMsQ0FBQztBQUMxQixDQUFDLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzU1QkcsU0FBUyxlQUFlLENBQUMsU0FBUyxFQUFFO0FBQzNDLEVBQUUsT0FBTyxDQUFDLElBQUksS0FBSztBQUNuQixJQUFJLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN2RCxJQUFJLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUN6QjtBQUNBLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEc7QUFDQSxJQUFJLE9BQU87QUFDWCxNQUFNLE9BQU8sRUFBRSxNQUFNO0FBQ3JCLFFBQVEsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELE9BQU87QUFDUCxLQUFLLENBQUM7QUFDTixHQUFHLENBQUM7QUFDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MkNDcUZTLEdBQVk7cUVBQ29CLEdBQVEsUUFBSyxXQUFXO3VFQUN6QixHQUFXLFFBQUssVUFBVTtnRUFDN0IsR0FBTztvRUFDTCxHQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NENBSnZDLEdBQVk7Ozs7c0VBQ29CLEdBQVEsUUFBSyxXQUFXOzs7O3dFQUN6QixHQUFXLFFBQUssVUFBVTs7OztpRUFDN0IsR0FBTzs7OztxRUFDTCxHQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FoR25DLFdBQVcsR0FBRyxZQUFZO09BTTFCLFFBQVEsR0FBRyxTQUFTO09BTXBCLFNBQVMsR0FBRyxFQUFFO09BTWQsUUFBUSxHQUFHLEtBQUs7T0FNaEIsT0FBTyxHQUFHLEtBQUs7T0FNZixTQUFTLEdBQUcsS0FBSztPQU1qQixVQUFVLEdBQUcsS0FBSztPQU1sQixRQUFRLEdBQUcsS0FBSztLQUV2QixXQUFXOztVQUNOLGlCQUFpQjtNQUNwQixlQUFlO0dBQ2pCLDRCQUE0QjtHQUM1QixPQUFPLElBQUksOEJBQThCO0dBQ3pDLFVBQVUsSUFBSSxtQ0FBbUM7SUFFaEQsTUFBTSxDQUFDLE9BQU8sRUFDZCxJQUFJLENBQUMsR0FBRzs7TUFDUCxXQUFXO1NBQ1AsVUFBVSxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyx1QkFBdUI7O09BQ3pFLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQzthQUNoQixLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUs7U0FDOUMsUUFBUTtNQUNWLFVBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFROzs7S0FFckQsVUFBVSxDQUFDLEtBQUssRUFBRSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxTQUFTLEdBQUcsZUFBZTs7OztPQUczRSxRQUFRLElBQUksUUFBUSxLQUFLLFNBQVM7VUFDOUIsY0FBYyxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxzQkFBc0I7O1FBQzVFLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQztjQUNwQixLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUs7TUFDdEQsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLEdBQUcsb0JBQW9COzs7Ozs7O0NBT2xHLFdBQVc7RUFDVCxpQkFBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JSLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW5CbkIsWUFBWTtJQUNiLFFBQVEsS0FBSyxXQUFXLElBQ3RCLFdBQVcsS0FBSyxZQUFZLDZDQUNhLFNBQVMsMEJBQTBCLFNBQVM7SUFDdkYsUUFBUSxLQUFLLFdBQVcsSUFDdEIsV0FBVyxLQUFLLFVBQVUsOENBQ2dCLFNBQVMsMEJBQTBCLFNBQVM7S0FFdkYsTUFBTSxDQUFDLE9BQU8sRUFDZCxJQUFJLENBQUMsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQzZDSixHQUFRLE9BQUksT0FBTyxpQkFBSSxHQUFRLE9BQUksVUFBVSxpQkFBSSxHQUFRLE9BQUksV0FBVzs7Ozs7O3NDQURuRSxHQUFXLG1DQUFjLEdBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0RBQWxDLEdBQVc7MkVBQWMsR0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFWdkMsR0FBUSxPQUFJLE9BQU8saUJBQUksR0FBUSxPQUFJLFVBQVUsaUJBQUksR0FBUSxPQUFJLFdBQVc7Ozs7Ozs7O2tCQUR4RSxHQUFXO2dDQUFjLEdBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0RBQWxDLEdBQVc7MkVBQWMsR0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswRUFnQmQsR0FBUSxPQUFJLFFBQVE7S0FBRyxjQUFjO0tBQUcsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrSEFBaEQsR0FBUSxPQUFJLFFBQVE7S0FBRyxjQUFjO0tBQUcsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswRUFYaEQsR0FBUSxPQUFJLFFBQVE7S0FBRyxjQUFjO0tBQUcsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrSEFBaEQsR0FBUSxPQUFJLFFBQVE7S0FBRyxjQUFjO0tBQUcsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFOeEUsR0FBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F0SEksUUFBUSxHQUFHLENBQUM7T0FNWixRQUFRLEdBQUcsS0FBSztPQU1oQixFQUFFLEdBQUcsRUFBRTtPQU1QLFNBQVMsR0FBRyxRQUFRO09BTXBCLElBQUksR0FBRyxFQUFFO09BTVQsTUFBTSxHQUFHLEVBQUU7T0FNWCxJQUFJLEdBQUcsUUFBUTtPQU1mLFFBQVEsR0FBRyxTQUFTO09BTXBCLE9BQU8sR0FBRyxLQUFLO09BTWYsT0FBTyxHQUFHLEtBQUs7T0FNZixVQUFVLEdBQUcsS0FBSztPQU9sQixPQUFPLEdBQUcsS0FBSztPQU9mLFVBQVUsR0FBRyxLQUFLO09BT2xCLFVBQVUsR0FBRyxLQUFLO09BRXZCLFlBQVksR0FBRyxlQUFlLENBQUMsaUJBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFDbkQsV0FBVztHQUNaLEVBQUU7R0FDRixJQUFJO0dBQ0osSUFBSSxFQUFFLFFBQVE7R0FDZCxRQUFRO0dBQ1IsUUFBUTtNQUNMLFdBQVc7R0FDZCxLQUFLO0lBQ0gsUUFBUSxLQUFLLFNBQVMsSUFBSSxpQkFBaUI7SUFDM0MsUUFBUSxLQUFLLFNBQVMsd0JBQXdCLE9BQU87SUFDckQsUUFBUSxLQUFLLFNBQVMsSUFBSSxPQUFPO0lBQ2pDLFFBQVEsS0FBSyxPQUFPLElBQUksc0JBQXNCO0lBQzlDLFFBQVEsS0FBSyxPQUFPLDZCQUE2QixPQUFPO0lBQ3hELFFBQVEsS0FBSyxPQUFPLEtBQUssT0FBTztNQUFHLDZCQUE2QjtNQUFHLDhCQUE4QjtJQUNqRyxRQUFRLEtBQUssVUFBVSxJQUFJLCtDQUErQztJQUMxRSxRQUFRLEtBQUssV0FBVyxJQUFJLGdEQUFnRDtJQUM1RSxRQUFRLEtBQUssUUFBUSxJQUFJLHVCQUF1QjtJQUNoRCxRQUFRLEtBQUssUUFBUSxJQUFJLE9BQU87SUFDaEMsUUFBUSxLQUFLLFFBQVEsSUFBSSxVQUFVLElBQUksbUNBQW1DO0lBQzFFLFVBQVUsSUFBSSxhQUFhO0lBQzNCLFFBQVEsSUFBSSxVQUFVLElBQUksYUFBYTtPQUNwQyxXQUFXLENBQUMsS0FBSztLQUVuQixNQUFNLENBQUMsT0FBTyxFQUNkLElBQUksQ0FBQyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNwSFIsU0FBUyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ2pDLEVBQUUsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDN0MsRUFBRSxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO0FBQ3JFLEVBQUUsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQztBQUN0RTtBQUNBLEVBQUUsT0FBTztBQUNULElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRztBQUN2QixJQUFJLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0FBQ3ZDLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSTtBQUMxQixJQUFJLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3RDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2IsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDYixJQUFJLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxXQUFXO0FBQzVDLElBQUksTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLFlBQVk7QUFDL0MsR0FBRyxDQUFDO0FBQ0osQ0FBQztBQUNEO0FBQ08sU0FBUyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFO0FBQzFELEVBQUUsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLEVBQUUsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLEVBQUUsSUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztBQUMzQyxFQUFFLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMvRjtBQUNBLEVBQUUsSUFBSSxXQUFXLEVBQUU7QUFDbkIsSUFBSSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ3RELE1BQU0sSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3pDLFFBQVEsUUFBUSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO0FBQ25FLFFBQVEsU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQ3RFLE9BQU87QUFDUCxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJDNGtCMEMsR0FBSzs7Ozs7Ozs7Ozs7Ozt5Q0FBTCxHQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29FQUFMLEdBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBSnhDLEdBQVEsUUFBSyxNQUFNO21CQUVkLEdBQVEsUUFBSyxRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUdBUlMsR0FBYyxPQUFJLE1BQU07NEJBQUcsR0FBa0I7d0JBQUcsR0FBYywrQkFDbkcsR0FBTyxvQkFBSSxHQUFRLFFBQUssTUFBTTtnREFBMkIsR0FBYyxPQUFJLE1BQU07NkJBQUcsR0FBa0I7eUJBQUcsR0FBYztzQ0FDdkgsR0FBVyxJQUFDLEtBQUs7OzRDQUNMLEdBQU07K0RBQ1csR0FBUSxRQUFLLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Mk1BSmIsR0FBYyxPQUFJLE1BQU07NEJBQUcsR0FBa0I7d0JBQUcsR0FBYywrQkFDbkcsR0FBTyxvQkFBSSxHQUFRLFFBQUssTUFBTTtnREFBMkIsR0FBYyxPQUFJLE1BQU07NkJBQUcsR0FBa0I7eUJBQUcsR0FBYztzQ0FDdkgsR0FBVyxJQUFDLEtBQUs7Ozs7OzZDQUNMLEdBQU07Ozs7Z0VBQ1csR0FBUSxRQUFLLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BL2xCMUMsTUFBTSxHQUFHLEtBQUs7T0FNZCxRQUFRLEdBQUcsTUFBTTtPQU9qQixjQUFjLEdBQUcsTUFBTTtPQU12QixPQUFPLEdBQUcsS0FBSztPQU1mLEtBQUssR0FBRyxlQUFlO0tBRTlCLGtCQUFrQixHQUFHLGFBQWE7S0FFbEMsT0FBTztLQUNQLFVBQVU7S0FDVixVQUFVO0tBQ1YsZUFBZTtLQUNmLGdCQUFnQjtLQUNoQixZQUFZO0tBQ1osYUFBYTtLQUNiLGVBQWU7S0FDZixnQkFBZ0I7O0NBRXBCLE9BQU87RUFDTCxTQUFTOzs7Q0FFWCxXQUFXO0VBQ1QsU0FBUzs7O1VBR0YsU0FBUztPQUNYLE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLHFCQUFxQjs7OztFQUc5RCxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLHFCQUFxQjtFQUM5RSxlQUFlLEdBQUcsVUFBVSxJQUFJLFVBQVUsQ0FBQyxLQUFLO0VBQ2hELGdCQUFnQixHQUFHLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTTtFQUNsRCxZQUFZLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxXQUFXO0VBQzdDLGFBQWEsR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLFlBQVk7RUFDL0MsZUFBZSxHQUFHLFVBQVUsSUFBSSxVQUFVLENBQUMsV0FBVztFQUN0RCxnQkFBZ0IsR0FBRyxVQUFVLElBQUksVUFBVSxDQUFDLFlBQVk7RUFFeEQsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGtDQUFrQyxFQUFFLGVBQWU7RUFDM0YsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLG1DQUFtQyxFQUFFLGdCQUFnQjtFQUM3RixPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsbUNBQW1DLEVBQUUsWUFBWTtFQUN6RixPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsb0NBQW9DLEVBQUUsYUFBYTtFQUMzRixPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsdUNBQXVDLEVBQUUsZUFBZTtFQUNoRyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsd0NBQXdDLEVBQUUsZ0JBQWdCOzs7VUFHM0YsU0FBUztNQUNaLFFBQVEsSUFBSSxNQUFNO1dBQ1osY0FBYyxJQUFJLE1BQU07U0FDekIsVUFBVSxDQUFDLENBQUMsR0FBRyxZQUFZLElBQzlCLFVBQVUsQ0FBQyxDQUFDLEdBQUcsYUFBYSxJQUM1QixVQUFVLENBQUMsS0FBSyxHQUFHLFlBQVksSUFDL0IsVUFBVSxDQUFDLE1BQU0sR0FBRyxhQUFhO3FCQUNqQyxrQkFBa0IsR0FBRyxTQUFTOztTQUUzQixVQUFVLENBQUMsQ0FBQyxHQUFHLFlBQVksSUFDOUIsVUFBVSxDQUFDLENBQUMsR0FBRyxhQUFhLElBQzVCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsWUFBWSxJQUMvQixVQUFVLENBQUMsTUFBTSxHQUFHLGFBQWE7cUJBQ2pDLGtCQUFrQixHQUFHLFVBQVU7O1NBRTVCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsWUFBWSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsWUFBWTtxQkFDakUsa0JBQWtCLEdBQUcsWUFBWTs7O3FCQUdqQyxrQkFBa0IsR0FBRyxhQUFhOzs7O01BR3BDLFFBQVEsSUFBSSxRQUFRO1dBQ2QsY0FBYyxJQUFJLE1BQU07U0FDekIsVUFBVSxDQUFDLENBQUMsR0FBRyxZQUFZLElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxZQUFZO3FCQUNqRSxrQkFBa0IsR0FBRyxZQUFZOztTQUU5QixVQUFVLENBQUMsQ0FBQyxHQUFHLFlBQVksSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLFlBQVk7cUJBQ2pFLGtCQUFrQixHQUFHLGFBQWE7O1NBRS9CLFVBQVUsQ0FBQyxDQUFDLEdBQUcsWUFBWSxJQUM5QixVQUFVLENBQUMsQ0FBQyxHQUFHLGFBQWEsSUFDNUIsVUFBVSxDQUFDLEtBQUssR0FBRyxZQUFZLElBQy9CLFVBQVUsQ0FBQyxNQUFNLEdBQUcsYUFBYTtxQkFDakMsa0JBQWtCLEdBQUcsV0FBVzs7O3FCQUdoQyxrQkFBa0IsR0FBRyxjQUFjOzs7Ozs7O0dBbWdCSSxVQUFVOzs7Ozs7O0dBVjlDLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4bUJwQjtBQUNBLENBQUMsQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUNuQixFQUFFLFNBQVMsZUFBZSxDQUFDLElBQUksRUFBRTtBQUNqQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDekYsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0MsS0FBSztBQUNMLElBQUksT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsR0FBRztBQUNIO0FBQ0EsRUFBRSxTQUFTLEtBQUssR0FBRztBQUNuQixJQUFJLElBQUksSUFBSSxZQUFZLEtBQUssRUFBRTtBQUMvQixNQUFNLE9BQU8sS0FBSyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyRyxLQUFLO0FBQ0wsSUFBSSxPQUFPLEtBQUssRUFBRSxDQUFDO0FBQ25CLEdBQUc7QUFDSCxFQUFFLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUNwQztBQUNBLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3hCLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3hCLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBRyxZQUFZO0FBQzVCLElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDaEUsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLElBQUksR0FBRyxLQUFLLENBQUM7QUFDZixDQUFDLEVBQUUsSUFBSSxDQUFDOztBQ3RCUixhQUFjLEdBQUc7QUFDakIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ2hDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDdEIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM5QixDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3pCLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDekIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMxQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25CLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUNsQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ3BCLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUN2QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM1QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzVCLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDeEIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ2xDLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUN6QixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3RCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDeEIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMxQixDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ2hDLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUN6QixDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDaEMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM1QixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM5QixDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ2hDLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7QUFDL0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUM5QixDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzlCLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDL0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUM1QixDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO0FBQzNCLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMzQixDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzNCLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUMzQixDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQy9CLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDN0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUN6QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDOUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUN0QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzVCLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDeEIsQ0FBQyxPQUFPLEVB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USxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDeEIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztBQUNoQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25CLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM1QixDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzdCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDMUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUM3QixDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzFCLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUN4QixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzFCLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDM0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztBQUM1QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxNQUFNLEVB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R0FBRyxRQUFRLENBQUMsUUFBUSxHQUFHLFFBQVEsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDcEQsR0FBRztBQUNILEVBQUUsTUFBTSxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3hDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEMsR0FBRztBQUNIO0FBQ0EsRUFBRSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNoQixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsR0FBRztBQUNILEVBQUUsTUFBTSxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3hELEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDaEIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLEdBQUc7QUFDSCxFQUFFLE1BQU0sSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFP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RUFBRSxHQUFHLENBQUM7QUFDM0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzNCLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDL0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUM3QixDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ3pCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM5QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDNUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN4QixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDOUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN4QixDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDM0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFF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RUFBRSxFQUFFLENBQUM7QUFDN0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMxQixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzdCLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDMUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM1QixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3hCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDMUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMzQixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3hCLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM1QixDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3ZCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDdEIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMzQixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3hCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMxQixDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3pCLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDekIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM5QixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDOUIsQ0FBQzs7O0FDdkpEO0FBQ3dDO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDekIsS0FBSyxJQUFJLEdBQUcsSUFBSUMsV0FBVyxFQUFFO0FBQzdCLENBQUMsSUFBSUEsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN0QyxFQUFFLGVBQWUsQ0FBQ0EsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzFDLEVBQUU7QUFDRixDQUFDO0FBQ0Q7QUFDQSxJQUFJLE9BQU8sR0FBRyxjQUFjLEdBQUc7QUFDL0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7QUFDcEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1QyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVDLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BELENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0QyxDQUFDLENBQUM7QUFDRjtBQUNBO0FBQ0EsS0FBSyxJQUFJLEtBQUssSUFBSSxPQUFPLEVBQUU7QUFDM0IsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDcEMsRUFBRSxJQUFJLEVBQUUsVUFBVSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3ZDLEdBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUMxRCxHQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksRUFBRSxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDckMsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2hFLEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxFQUFFO0FBQ2hFLEdBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRSxHQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDekMsRUFBRSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3JDLEVBQUUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ2pDLEVBQUUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQy9CLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDdkUsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNuRSxFQUFFO0FBQ0YsQ0FBQztBQUNEO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdEIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxJQUFJLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQO0FBQ0EsQ0FBQyxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7QUFDbEIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1IsRUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUN2QixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO0FBQ3RCLEVBQUUsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDdkIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUM7QUFDMUIsRUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUN2QixFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUMxQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0I7QUFDQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNaLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUNYLEVBQUU7QUFDRjtBQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDckI7QUFDQSxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsRUFBRTtBQUNsQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDUixFQUFFLE1BQU0sSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO0FBQ3RCLEVBQUUsQ0FBQyxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDMUIsRUFBRSxNQUFNO0FBQ1IsRUFBRSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDOUIsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLElBQUksQ0FBQztBQUNWLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDVixDQUFDLElBQUksSUFBSSxDQUFDO0FBQ1YsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtBQUNBLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQzFCLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLEVBQUUsQ0FBQztBQUNIO0FBQ0EsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDakIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNaLEVBQUUsTUFBTTtBQUNSLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZixFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQjtBQUNBLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2YsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNuQixHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FB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QUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ3RFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUN0RTtBQUNBLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDcEQsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztBQUNwRCxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ3BEO0FBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQ2pDLENBQUMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxD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QyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNO0FBQ3RDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTTtBQUN0QyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDdEMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ3RDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUN0QyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDdEMsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBSSxFQUFFO0FBQ25DLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2QixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2QixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtBQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDO0FBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQ2pDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDakQsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztBQUNqRDtBQUNBO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVM7QUFDbEIsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksS0FBSztBQUM3QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDZDtBQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTO0FBQ2xCLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEtBQUs7QUFDN0MsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ2Q7QUFDQSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUztBQUNsQixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxLQUFLO0FBQzdDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNkO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakM7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1A7QUFDQSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7QUFDYixDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDVixDQUFDLENBQUMsSUFBSSxPQUFPLENBQUM7QUFDZDtBQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbEUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNsRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2xFO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQixDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkI7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1A7QUFDQSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksR0FBRyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2pCO0FBQ0EsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QixDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUM7QUFDakQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUM7QUFDakQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUM7QUFDakQ7QUFDQSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7QUFDYixDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDVixDQUFDLENBQUMsSUFBSSxPQUFPLENBQUM7QUFDZDtBQUNBLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBQ0Y7QUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUNqQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtBQUNBLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDNUI7QUFDQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNaLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUNYLEVBQUU7QUFDRjtBQUNBLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUI7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1I7QUFDQSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzVCLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCO0FBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFVBQVUsSUFBSSxFQUFFO0FBQ3JDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEU7QUFDQSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNoQztBQUNBLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2xCLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDWixFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUU7QUFDZCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztBQUM5QixLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekI7QUFDQSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNsQixFQUFFLElBQUksSUFBSSxFQUFFLENBQUM7QUFDYixFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQyxDQUFDO0FBQ0Y7QUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLElBQUksRUFBRTtBQUNyQztBQUNBO0FBQ0EsQ0FBQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsVUFBVSxJQUFJLEVBQUU7QUFDdEMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakI7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN6QixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNiLEdBQUcsT0FBTyxFQUFFLENBQUM7QUFDYixHQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtBQUNmLEdBQUcsT0FBTyxHQUFHLENBQUM7QUFDZCxHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2hELEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUNkLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUI7QUFDQSxDQUFDLE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQyxDQUFDO0FBQ0Y7QUFDQSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxVQUFVLElBQUksRUFBRTtBQUNyQyxDQUFDLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDdkI7QUFDQTtBQUNBLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDakMsRUFBRSxJQUFJLElBQUksR0FBRyxFQUFFLEVBQUU7QUFDakIsR0FBRyxLQUFLLElBQUksR0FBRyxDQUFDO0FBQ2hCLEdBQUc7QUFDSDtBQUNBLEVBQUUsS0FBSyxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQzdCO0FBQ0EsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ3RDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQztBQUNwQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUM7QUFDM0MsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDO0FBQzNDO0FBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBSSxFQUFFO0FBQ3RDO0FBQ0EsQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7QUFDbEIsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNaO0FBQ0EsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUNULENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN6QyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3JELENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDN0I7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxJQUFJLEVBQUU7QUFDbEMsQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssRUFBRTtBQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDO0FBQ3ZDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqQztBQUNBLENBQUMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNqRCxDQUFDLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQ25ELENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxJQUFJLEVBQUU7QUFDbEMsQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNiLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbkIsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUI7QUFDQSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDNUIsRUFBRSxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDMUQsR0FBRyxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQztBQUNoQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDL0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3hCO0FBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQ2pDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQyxJQUFJLFNBQVMsQ0FBQztBQUNmLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDVDtBQUNBLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2pCLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDakMsRUFBRSxNQUFNO0FBQ1IsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ2xCLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNWLEVBQUU7QUFDRixDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtBQUNoQixFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDO0FBQy9CLEVBQUU7QUFDRixDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtBQUNoQixFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQztBQUM3QixFQUFFLE1BQU07QUFDUixFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDakMsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ1YsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ1Y7QUFDQSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1g7QUFDQSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtBQUNkLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLEVBQUUsTUFBTTtBQUNSLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFCLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQ2QsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEMsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QjtBQUNBLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNmLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1g7QUFDQSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtBQUNkLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEIsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdEI7QUFDQSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUNoQixFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDWjtBQUNBLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUN2QixFQUFFLEtBQUssQ0FBQztBQUNSLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNoRCxFQUFFLEtBQUssQ0FBQztBQUNSLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNoRCxFQUFFLEtBQUssQ0FBQztBQUNSLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNoRCxFQUFFLEtBQUssQ0FBQztBQUNSLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNoRCxFQUFFLEtBQUssQ0FBQztBQUNSLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNoRCxFQUFFO0FBQ0YsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekMsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQjtBQUNBLENBQUMsT0FBTztBQUNSLEVBQUUsQ0FBQyxD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RSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0YsR0FBRztBQUNIO0FBQ0EsRUFBRSxLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUU7QUFDeEIsSUFBSSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDMUIsTUFBTSxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckYsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDdkIsR0FBRztBQUNIO0FBQ0E7QUFDQSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQztBQUNBLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUU7QUFDckUsSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDckMsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0MsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pDO0FBQ0EsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQztBQUNBLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEM7QUFDQSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDO0FBQ0EsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDO0FBQ0EsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxD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SSxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEMsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDNUIsSUFBSSxJQUFJLENBQUMsR0FBRyxNQUFNLEtBQUssU0FBUyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7QUFDaEQ7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLElBQUksSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM1QztBQUNBLElBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDcEUsSUFBSSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsSUFBSSxPQUFPLEtBQUssQ0FBQyxHQUFHO0FBQ3BCLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRTtBQUMzQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUU7QUFDL0MsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQzdDLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuRCxLQUFLLENBQUM7QUFDTixHQUFHO0FBQ0gsQ0FBQyxD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
