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

// (151:14) {#if route.url.replace('./', '') === segment || (route.url === './' && !segment && i == 0)}
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
			attr_dev(span, "class", "svelte-pnge35");
			add_location(span, file$b, 151, 16, 3488);
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
		source: "(151:14) {#if route.url.replace('./', '') === segment || (route.url === './' && !segment && i == 0)}",
		ctx
	});

	return block;
}

// (146:8) {#each router[$rubusDocConfig.lang] as route, i}
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
			attr_dev(a, "class", "svelte-pnge35");
			add_location(a, file$b, 149, 12, 3333);
			attr_dev(li, "class", "route-item svelte-pnge35");
			toggle_class(li, "current-route", /*route*/ ctx[17].url.replace("./", "") === /*segment*/ ctx[0] || /*route*/ ctx[17].url === "./" && !/*segment*/ ctx[0] && /*i*/ ctx[13] == 0);
			add_location(li, file$b, 146, 10, 3165);
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
		source: "(146:8) {#each router[$rubusDocConfig.lang] as route, i}",
		ctx
	});

	return block;
}

// (165:10) {#each themeList as item, index}
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
		source: "(165:10) {#each themeList as item, index}",
		ctx
	});

	return block;
}

// (160:8) <Dropdown           placeholder={$rubusDocConfig.theme.replace(/^\S/, (s) => s.toUpperCase())}           isQuiet           minWidth="80"           resultIndex={resultThemeIndex}>
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
		source: "(160:8) <Dropdown           placeholder={$rubusDocConfig.theme.replace(/^\\S/, (s) => s.toUpperCase())}           isQuiet           minWidth=\\\"80\\\"           resultIndex={resultThemeIndex}>",
		ctx
	});

	return block;
}

// (178:10) {#each languageList as lang, i}
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
		source: "(178:10) {#each languageList as lang, i}",
		ctx
	});

	return block;
}

// (177:8) <Dropdown placeholder="Language" isQuiet minWidth="80" resultIndex={resultLanguageIndex}>
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
		source: "(177:8) <Dropdown placeholder=\\\"Language\\\" isQuiet minWidth=\\\"80\\\" resultIndex={resultLanguageIndex}>",
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
			attr_dev(img, "class", "svelte-pnge35");
			add_location(img, file$b, 138, 8, 2873);
			attr_dev(a, "href", "./");
			attr_dev(a, "class", "svelte-pnge35");
			add_location(a, file$b, 137, 6, 2851);
			attr_dev(li0, "class", "nav-item nav-logo svelte-pnge35");
			add_location(li0, file$b, 136, 4, 2814);
			attr_dev(ul0, "class", "router-wrap svelte-pnge35");
			add_location(ul0, file$b, 144, 6, 3073);
			attr_dev(li1, "class", "nav-item svelte-pnge35");
			add_location(li1, file$b, 143, 4, 3045);
			attr_dev(div0, "class", "theme-list svelte-pnge35");
			add_location(div0, file$b, 158, 6, 3621);
			attr_dev(div1, "class", "language-list svelte-pnge35");
			add_location(div1, file$b, 175, 6, 4185);
			attr_dev(li2, "class", "nav-item nav-menu-area svelte-pnge35");
			add_location(li2, file$b, 157, 4, 3579);
			attr_dev(ul1, "class", "nav-wrap svelte-pnge35");
			add_location(ul1, file$b, 135, 2, 2788);
			attr_dev(nav, "class", "svelte-pnge35");
			add_location(nav, file$b, 134, 0, 2780);
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

// (41:0) <Cornerstone spectrumTheme={$_rubusDocConfig.theme}>
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
			add_location(main, file$c, 42, 2, 1227);
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
		source: "(41:0) <Cornerstone spectrumTheme={$_rubusDocConfig.theme}>",
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

	const rubusDocConfig = writable({
		name: "Rubus",
		lang: "zh",
		theme: "light"
	});

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
		js: () => Promise.all([import('./index.0303e479.js'), __inject_styles(["client-075fc7f6.css"])]).then(function(x) { return x[0]; })
	},
	{
		js: () => Promise.all([import('./_layout.d327d65c.js'), __inject_styles(["client-075fc7f6.css","_layout-21e613b6.css"])]).then(function(x) { return x[0]; })
	},
	{
		js: () => Promise.all([import('./index.17493318.js'), __inject_styles(["client-075fc7f6.css"])]).then(function(x) { return x[0]; })
	},
	{
		js: () => Promise.all([import('./index.21666f11.js'), __inject_styles(["client-075fc7f6.css"])]).then(function(x) { return x[0]; })
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

export { current_component as A, getEventsAction as B, space as C, claim_space as D, toggle_class as E, action_destroyer as F, binding_callbacks as G, stores$1 as H, validate_store as I, component_subscribe as J, validate_each_argument as K, empty as L, group_outros as M, check_outros as N, destroy_each as O, query_selector_all as P, createCommonjsModule as Q, commonjsGlobal as R, SvelteComponentDev as S, children as a, claim_text as b, claim_element as c, dispatch_dev as d, element as e, detach_dev as f, attr_dev as g, add_location as h, init as i, insert_dev as j, append_dev as k, set_data_dev as l, create_component as m, noop as n, onMount as o, claim_component as p, mount_component as q, transition_in as r, safe_not_equal as s, text as t, transition_out as u, validate_slots as v, destroy_component as w, create_slot as x, update_slot as y, afterUpdate as z };

import __inject_styles from './inject_styles.5607aec6.js';//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LjQxYTdhYWMwLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL2ludGVybmFsL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3RvcmUvaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2ludGVybmFsL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3N2ZWx0ZS1zcGVjdHJ1bS1pY29ucy11aS9zcmMvQWxlcnRNZWRpdW0uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9zdmVsdGUtc3BlY3RydW0taWNvbnMtdWkvc3JjL0NoZWNrbWFya01lZGl1bS5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3N2ZWx0ZS1zcGVjdHJ1bS1pY29ucy11aS9zcmMvQ2hldnJvbkRvd25NZWRpdW0uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9zdmVsdGUtc3BlY3RydW0taWNvbnMtdWkvc3JjL0NoZXZyb25SaWdodE1lZGl1bS5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVzaXplLW9ic2VydmVyLXBvbHlmaWxsL2Rpc3QvUmVzaXplT2JzZXJ2ZXIuZXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3J1YnVzL3NyYy9wYWNrYWdlcy91dGlscy9nZXQtZXZlbnRzLWFjdGlvbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL0FjdGlvbkdyb3VwL0FjdGlvbkdyb3VwLnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL0J1dHRvbi9CdXR0b24uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvdXRpbHMvZWxlbWVudC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL1BvcG92ZXIvUG9wb3Zlci5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHJ1YnVzL3J1YnVzL3NyYy9wYWNrYWdlcy9DYWxlbmRhci9maXgtZGF0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1uYW1lL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3NpbXBsZS1zd2l6emxlL25vZGVfbW9kdWxlcy9pcy1hcnJheWlzaC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zaW1wbGUtc3dpenpsZS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1zdHJpbmcvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1jb252ZXJ0L2NvbnZlcnNpb25zLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvcm91dGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL3V0aWxzL2NvbG9yL2NvbG9yLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvQ29ybmVyc3RvbmUvQ29ybmVyc3RvbmUuc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvTWVudS9NZW51LnN2ZWx0ZSIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL01lbnUvTWVudUl0ZW0uc3ZlbHRlIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvRHJvcGRvd24vRHJvcGRvd24uc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvbmF2L05hdi5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvcm91dGVzL19sYXlvdXQuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9fZXJyb3Iuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2ludGVybmFsL0FwcC5zdmVsdGUiLCIuLi8uLi8uLi9zcmMvbm9kZV9tb2R1bGVzL0BzYXBwZXIvaW50ZXJuYWwvbWFuaWZlc3QtY2xpZW50Lm1qcyIsIi4uLy4uLy4uL3NyYy9ub2RlX21vZHVsZXMvQHNhcHBlci9hcHAubWpzIiwiLi4vLi4vLi4vc3JjL2NsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBub29wKCkgeyB9XG5jb25zdCBpZGVudGl0eSA9IHggPT4geDtcbmZ1bmN0aW9uIGFzc2lnbih0YXIsIHNyYykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBmb3IgKGNvbnN0IGsgaW4gc3JjKVxuICAgICAgICB0YXJba10gPSBzcmNba107XG4gICAgcmV0dXJuIHRhcjtcbn1cbmZ1bmN0aW9uIGlzX3Byb21pc2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIGFkZF9sb2NhdGlvbihlbGVtZW50LCBmaWxlLCBsaW5lLCBjb2x1bW4sIGNoYXIpIHtcbiAgICBlbGVtZW50Ll9fc3ZlbHRlX21ldGEgPSB7XG4gICAgICAgIGxvYzogeyBmaWxlLCBsaW5lLCBjb2x1bW4sIGNoYXIgfVxuICAgIH07XG59XG5mdW5jdGlvbiBydW4oZm4pIHtcbiAgICByZXR1cm4gZm4oKTtcbn1cbmZ1bmN0aW9uIGJsYW5rX29iamVjdCgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cbmZ1bmN0aW9uIHJ1bl9hbGwoZm5zKSB7XG4gICAgZm5zLmZvckVhY2gocnVuKTtcbn1cbmZ1bmN0aW9uIGlzX2Z1bmN0aW9uKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIHNhZmVfbm90X2VxdWFsKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPSBhID8gYiA9PSBiIDogYSAhPT0gYiB8fCAoKGEgJiYgdHlwZW9mIGEgPT09ICdvYmplY3QnKSB8fCB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5mdW5jdGlvbiBub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiO1xufVxuZnVuY3Rpb24gaXNfZW1wdHkob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfc3RvcmUoc3RvcmUsIG5hbWUpIHtcbiAgICBpZiAoc3RvcmUgIT0gbnVsbCAmJiB0eXBlb2Ygc3RvcmUuc3Vic2NyaWJlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7bmFtZX0nIGlzIG5vdCBhIHN0b3JlIHdpdGggYSAnc3Vic2NyaWJlJyBtZXRob2RgKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzdWJzY3JpYmUoc3RvcmUsIC4uLmNhbGxiYWNrcykge1xuICAgIGlmIChzdG9yZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IHN0b3JlLnN1YnNjcmliZSguLi5jYWxsYmFja3MpO1xuICAgIHJldHVybiB1bnN1Yi51bnN1YnNjcmliZSA/ICgpID0+IHVuc3ViLnVuc3Vic2NyaWJlKCkgOiB1bnN1Yjtcbn1cbmZ1bmN0aW9uIGdldF9zdG9yZV92YWx1ZShzdG9yZSkge1xuICAgIGxldCB2YWx1ZTtcbiAgICBzdWJzY3JpYmUoc3RvcmUsIF8gPT4gdmFsdWUgPSBfKSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudF9zdWJzY3JpYmUoY29tcG9uZW50LCBzdG9yZSwgY2FsbGJhY2spIHtcbiAgICBjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKHN1YnNjcmliZShzdG9yZSwgY2FsbGJhY2spKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zbG90KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICBjb25zdCBzbG90X2N0eCA9IGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbik7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uWzBdKHNsb3RfY3R4KTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvblsxXSAmJiBmblxuICAgICAgICA/IGFzc2lnbigkJHNjb3BlLmN0eC5zbGljZSgpLCBkZWZpbml0aW9uWzFdKGZuKGN0eCkpKVxuICAgICAgICA6ICQkc2NvcGUuY3R4O1xufVxuZnVuY3Rpb24gZ2V0X3Nsb3RfY2hhbmdlcyhkZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvblsyXSAmJiBmbikge1xuICAgICAgICBjb25zdCBsZXRzID0gZGVmaW5pdGlvblsyXShmbihkaXJ0eSkpO1xuICAgICAgICBpZiAoJCRzY29wZS5kaXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbGV0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxldHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KCQkc2NvcGUuZGlydHkubGVuZ3RoLCBsZXRzLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0gJCRzY29wZS5kaXJ0eVtpXSB8IGxldHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkJHNjb3BlLmRpcnR5IHwgbGV0cztcbiAgICB9XG4gICAgcmV0dXJuICQkc2NvcGUuZGlydHk7XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdChzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZGlydHksIGdldF9zbG90X2NoYW5nZXNfZm4sIGdldF9zbG90X2NvbnRleHRfZm4pIHtcbiAgICBjb25zdCBzbG90X2NoYW5nZXMgPSBnZXRfc2xvdF9jaGFuZ2VzKHNsb3RfZGVmaW5pdGlvbiwgJCRzY29wZSwgZGlydHksIGdldF9zbG90X2NoYW5nZXNfZm4pO1xuICAgIGlmIChzbG90X2NoYW5nZXMpIHtcbiAgICAgICAgY29uc3Qgc2xvdF9jb250ZXh0ID0gZ2V0X3Nsb3RfY29udGV4dChzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZ2V0X3Nsb3RfY29udGV4dF9mbik7XG4gICAgICAgIHNsb3QucChzbG90X2NvbnRleHQsIHNsb3RfY2hhbmdlcyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZXhjbHVkZV9pbnRlcm5hbF9wcm9wcyhwcm9wcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBwcm9wcylcbiAgICAgICAgaWYgKGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb21wdXRlX3Jlc3RfcHJvcHMocHJvcHMsIGtleXMpIHtcbiAgICBjb25zdCByZXN0ID0ge307XG4gICAga2V5cyA9IG5ldyBTZXQoa2V5cyk7XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoIWtleXMuaGFzKGspICYmIGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3Rba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfc2xvdHMoc2xvdHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzbG90cykge1xuICAgICAgICByZXN1bHRba2V5XSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgbGV0IHJhbiA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAocmFuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByYW4gPSB0cnVlO1xuICAgICAgICBmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG59XG5mdW5jdGlvbiBudWxsX3RvX2VtcHR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X3N0b3JlX3ZhbHVlKHN0b3JlLCByZXQsIHZhbHVlID0gcmV0KSB7XG4gICAgc3RvcmUuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gcmV0O1xufVxuY29uc3QgaGFzX3Byb3AgPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbmZ1bmN0aW9uIGFjdGlvbl9kZXN0cm95ZXIoYWN0aW9uX3Jlc3VsdCkge1xuICAgIHJldHVybiBhY3Rpb25fcmVzdWx0ICYmIGlzX2Z1bmN0aW9uKGFjdGlvbl9yZXN1bHQuZGVzdHJveSkgPyBhY3Rpb25fcmVzdWx0LmRlc3Ryb3kgOiBub29wO1xufVxuXG5jb25zdCBpc19jbGllbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbmxldCBub3cgPSBpc19jbGllbnRcbiAgICA/ICgpID0+IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgIDogKCkgPT4gRGF0ZS5ub3coKTtcbmxldCByYWYgPSBpc19jbGllbnQgPyBjYiA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2IpIDogbm9vcDtcbi8vIHVzZWQgaW50ZXJuYWxseSBmb3IgdGVzdGluZ1xuZnVuY3Rpb24gc2V0X25vdyhmbikge1xuICAgIG5vdyA9IGZuO1xufVxuZnVuY3Rpb24gc2V0X3JhZihmbikge1xuICAgIHJhZiA9IGZuO1xufVxuXG5jb25zdCB0YXNrcyA9IG5ldyBTZXQoKTtcbmZ1bmN0aW9uIHJ1bl90YXNrcyhub3cpIHtcbiAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xuICAgICAgICBpZiAoIXRhc2suYyhub3cpKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgICAgICB0YXNrLmYoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh0YXNrcy5zaXplICE9PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbn1cbi8qKlxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMgb25seSFcbiAqL1xuZnVuY3Rpb24gY2xlYXJfbG9vcHMoKSB7XG4gICAgdGFza3MuY2xlYXIoKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB0YXNrIHRoYXQgcnVucyBvbiBlYWNoIHJhZiBmcmFtZVxuICogdW50aWwgaXQgcmV0dXJucyBhIGZhbHN5IHZhbHVlIG9yIGlzIGFib3J0ZWRcbiAqL1xuZnVuY3Rpb24gbG9vcChjYWxsYmFjaykge1xuICAgIGxldCB0YXNrO1xuICAgIGlmICh0YXNrcy5zaXplID09PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBuZXcgUHJvbWlzZShmdWxmaWxsID0+IHtcbiAgICAgICAgICAgIHRhc2tzLmFkZCh0YXNrID0geyBjOiBjYWxsYmFjaywgZjogZnVsZmlsbCB9KTtcbiAgICAgICAgfSksXG4gICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kKHRhcmdldCwgbm9kZSkge1xuICAgIHRhcmdldC5hcHBlbmRDaGlsZChub2RlKTtcbn1cbmZ1bmN0aW9uIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgYW5jaG9yIHx8IG51bGwpO1xufVxuZnVuY3Rpb24gZGV0YWNoKG5vZGUpIHtcbiAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG59XG5mdW5jdGlvbiBkZXN0cm95X2VhY2goaXRlcmF0aW9ucywgZGV0YWNoaW5nKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChpdGVyYXRpb25zW2ldKVxuICAgICAgICAgICAgaXRlcmF0aW9uc1tpXS5kKGRldGFjaGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSk7XG59XG5mdW5jdGlvbiBlbGVtZW50X2lzKG5hbWUsIGlzKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSwgeyBpcyB9KTtcbn1cbmZ1bmN0aW9uIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMob2JqLCBleGNsdWRlKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0ge307XG4gICAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgICAgICBpZiAoaGFzX3Byb3Aob2JqLCBrKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgJiYgZXhjbHVkZS5pbmRleE9mKGspID09PSAtMSkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgdGFyZ2V0W2tdID0gb2JqW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBzdmdfZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBuYW1lKTtcbn1cbmZ1bmN0aW9uIHRleHQoZGF0YSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKTtcbn1cbmZ1bmN0aW9uIHNwYWNlKCkge1xuICAgIHJldHVybiB0ZXh0KCcgJyk7XG59XG5mdW5jdGlvbiBlbXB0eSgpIHtcbiAgICByZXR1cm4gdGV4dCgnJyk7XG59XG5mdW5jdGlvbiBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcHJldmVudF9kZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc3RvcF9wcm9wYWdhdGlvbihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzZWxmKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMpXG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpXG4gICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgZWxzZSBpZiAobm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpXG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gc2V0X2F0dHJpYnV0ZXMobm9kZSwgYXR0cmlidXRlcykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG5vZGUuX19wcm90b19fKTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzW2tleV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuY3NzVGV4dCA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdfX3ZhbHVlJykge1xuICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZXNjcmlwdG9yc1trZXldICYmIGRlc2NyaXB0b3JzW2tleV0uc2V0KSB7XG4gICAgICAgICAgICBub2RlW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdmdfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YShub2RlLCBwcm9wLCB2YWx1ZSkge1xuICAgIGlmIChwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgbm9kZVtwcm9wXSA9IHZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYXR0cihub2RlLCBwcm9wLCB2YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24geGxpbmtfYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIGF0dHJpYnV0ZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUoZ3JvdXAsIF9fdmFsdWUsIGNoZWNrZWQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyb3VwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChncm91cFtpXS5jaGVja2VkKVxuICAgICAgICAgICAgdmFsdWUuYWRkKGdyb3VwW2ldLl9fdmFsdWUpO1xuICAgIH1cbiAgICBpZiAoIWNoZWNrZWQpIHtcbiAgICAgICAgdmFsdWUuZGVsZXRlKF9fdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG59XG5mdW5jdGlvbiB0b19udW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09ICcnID8gbnVsbCA6ICt2YWx1ZTtcbn1cbmZ1bmN0aW9uIHRpbWVfcmFuZ2VzX3RvX2FycmF5KHJhbmdlcykge1xuICAgIGNvbnN0IGFycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYXJyYXkucHVzaCh7IHN0YXJ0OiByYW5nZXMuc3RhcnQoaSksIGVuZDogcmFuZ2VzLmVuZChpKSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZnVuY3Rpb24gY2hpbGRyZW4oZWxlbWVudCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2hpbGROb2Rlcyk7XG59XG5mdW5jdGlvbiBjbGFpbV9lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBzdmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZSA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKGogPCBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbm9kZS5hdHRyaWJ1dGVzW2orK107XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmUucHVzaChhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCByZW1vdmUubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShyZW1vdmVba10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzLnNwbGljZShpLCAxKVswXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3ZnID8gc3ZnX2VsZW1lbnQobmFtZSkgOiBlbGVtZW50KG5hbWUpO1xufVxuZnVuY3Rpb24gY2xhaW1fdGV4dChub2RlcywgZGF0YSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gJycgKyBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGVzLnNwbGljZShpLCAxKVswXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGV4dChkYXRhKTtcbn1cbmZ1bmN0aW9uIGNsYWltX3NwYWNlKG5vZGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX3RleHQobm9kZXMsICcgJyk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YSh0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgIT09IGRhdGEpXG4gICAgICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiBzZXRfaW5wdXRfdmFsdWUoaW5wdXQsIHZhbHVlKSB7XG4gICAgaW5wdXQudmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF90eXBlKGlucHV0LCB0eXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaW5wdXQudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3R5bGUobm9kZSwga2V5LCB2YWx1ZSwgaW1wb3J0YW50KSB7XG4gICAgbm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnQgPyAnaW1wb3J0YW50JyA6ICcnKTtcbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb24oc2VsZWN0LCB2YWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0Lm9wdGlvbnNbaV07XG4gICAgICAgIGlmIChvcHRpb24uX192YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzZWxlY3Rfb3B0aW9ucyhzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gfnZhbHVlLmluZGV4T2Yob3B0aW9uLl9fdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF92YWx1ZShzZWxlY3QpIHtcbiAgICBjb25zdCBzZWxlY3RlZF9vcHRpb24gPSBzZWxlY3QucXVlcnlTZWxlY3RvcignOmNoZWNrZWQnKSB8fCBzZWxlY3Qub3B0aW9uc1swXTtcbiAgICByZXR1cm4gc2VsZWN0ZWRfb3B0aW9uICYmIHNlbGVjdGVkX29wdGlvbi5fX3ZhbHVlO1xufVxuZnVuY3Rpb24gc2VsZWN0X211bHRpcGxlX3ZhbHVlKHNlbGVjdCkge1xuICAgIHJldHVybiBbXS5tYXAuY2FsbChzZWxlY3QucXVlcnlTZWxlY3RvckFsbCgnOmNoZWNrZWQnKSwgb3B0aW9uID0+IG9wdGlvbi5fX3ZhbHVlKTtcbn1cbi8vIHVuZm9ydHVuYXRlbHkgdGhpcyBjYW4ndCBiZSBhIGNvbnN0YW50IGFzIHRoYXQgd291bGRuJ3QgYmUgdHJlZS1zaGFrZWFibGVcbi8vIHNvIHdlIGNhY2hlIHRoZSByZXN1bHQgaW5zdGVhZFxubGV0IGNyb3Nzb3JpZ2luO1xuZnVuY3Rpb24gaXNfY3Jvc3NvcmlnaW4oKSB7XG4gICAgaWYgKGNyb3Nzb3JpZ2luID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3Jvc3NvcmlnaW4gPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdm9pZCB3aW5kb3cucGFyZW50LmRvY3VtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY3Jvc3NvcmlnaW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcm9zc29yaWdpbjtcbn1cbmZ1bmN0aW9uIGFkZF9yZXNpemVfbGlzdGVuZXIobm9kZSwgZm4pIHtcbiAgICBjb25zdCBjb21wdXRlZF9zdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3Qgel9pbmRleCA9IChwYXJzZUludChjb21wdXRlZF9zdHlsZS56SW5kZXgpIHx8IDApIC0gMTtcbiAgICBpZiAoY29tcHV0ZWRfc3R5bGUucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIH1cbiAgICBjb25zdCBpZnJhbWUgPSBlbGVtZW50KCdpZnJhbWUnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7ICcgK1xuICAgICAgICBgb3ZlcmZsb3c6IGhpZGRlbjsgYm9yZGVyOiAwOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogJHt6X2luZGV4fTtgKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgaWZyYW1lLnRhYkluZGV4ID0gLTE7XG4gICAgY29uc3QgY3Jvc3NvcmlnaW4gPSBpc19jcm9zc29yaWdpbigpO1xuICAgIGxldCB1bnN1YnNjcmliZTtcbiAgICBpZiAoY3Jvc3NvcmlnaW4pIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9IFwiZGF0YTp0ZXh0L2h0bWwsPHNjcmlwdD5vbnJlc2l6ZT1mdW5jdGlvbigpe3BhcmVudC5wb3N0TWVzc2FnZSgwLCcqJyl9PC9zY3JpcHQ+XCI7XG4gICAgICAgIHVuc3Vic2NyaWJlID0gbGlzdGVuKHdpbmRvdywgJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IGlmcmFtZS5jb250ZW50V2luZG93KVxuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICAgIGlmcmFtZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3RlbihpZnJhbWUuY29udGVudFdpbmRvdywgJ3Jlc2l6ZScsIGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXBwZW5kKG5vZGUsIGlmcmFtZSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVuc3Vic2NyaWJlICYmIGlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRldGFjaChpZnJhbWUpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0b2dnbGVfY2xhc3MoZWxlbWVudCwgbmFtZSwgdG9nZ2xlKSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3RbdG9nZ2xlID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG59XG5mdW5jdGlvbiBjdXN0b21fZXZlbnQodHlwZSwgZGV0YWlsKSB7XG4gICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgZGV0YWlsKTtcbiAgICByZXR1cm4gZTtcbn1cbmZ1bmN0aW9uIHF1ZXJ5X3NlbGVjdG9yX2FsbChzZWxlY3RvciwgcGFyZW50ID0gZG9jdW1lbnQuYm9keSkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG59XG5jbGFzcyBIdG1sVGFnIHtcbiAgICBjb25zdHJ1Y3RvcihhbmNob3IgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYSA9IGFuY2hvcjtcbiAgICAgICAgdGhpcy5lID0gdGhpcy5uID0gbnVsbDtcbiAgICB9XG4gICAgbShodG1sLCB0YXJnZXQsIGFuY2hvciA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmUpIHtcbiAgICAgICAgICAgIHRoaXMuZSA9IGVsZW1lbnQodGFyZ2V0Lm5vZGVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMudCA9IHRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuaChodG1sKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmkoYW5jaG9yKTtcbiAgICB9XG4gICAgaChodG1sKSB7XG4gICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB0aGlzLm4gPSBBcnJheS5mcm9tKHRoaXMuZS5jaGlsZE5vZGVzKTtcbiAgICB9XG4gICAgaShhbmNob3IpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluc2VydCh0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwKGh0bWwpIHtcbiAgICAgICAgdGhpcy5kKCk7XG4gICAgICAgIHRoaXMuaChodG1sKTtcbiAgICAgICAgdGhpcy5pKHRoaXMuYSk7XG4gICAgfVxuICAgIGQoKSB7XG4gICAgICAgIHRoaXMubi5mb3JFYWNoKGRldGFjaCk7XG4gICAgfVxufVxuXG5jb25zdCBhY3RpdmVfZG9jcyA9IG5ldyBTZXQoKTtcbmxldCBhY3RpdmUgPSAwO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhcmtza3lhcHAvc3RyaW5nLWhhc2gvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGhhc2goc3RyKSB7XG4gICAgbGV0IGhhc2ggPSA1MzgxO1xuICAgIGxldCBpID0gc3RyLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgXiBzdHIuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9ydWxlKG5vZGUsIGEsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzZSwgZm4sIHVpZCA9IDApIHtcbiAgICBjb25zdCBzdGVwID0gMTYuNjY2IC8gZHVyYXRpb247XG4gICAgbGV0IGtleWZyYW1lcyA9ICd7XFxuJztcbiAgICBmb3IgKGxldCBwID0gMDsgcCA8PSAxOyBwICs9IHN0ZXApIHtcbiAgICAgICAgY29uc3QgdCA9IGEgKyAoYiAtIGEpICogZWFzZShwKTtcbiAgICAgICAga2V5ZnJhbWVzICs9IHAgKiAxMDAgKyBgJXske2ZuKHQsIDEgLSB0KX19XFxuYDtcbiAgICB9XG4gICAgY29uc3QgcnVsZSA9IGtleWZyYW1lcyArIGAxMDAlIHske2ZuKGIsIDEgLSBiKX19XFxufWA7XG4gICAgY29uc3QgbmFtZSA9IGBfX3N2ZWx0ZV8ke2hhc2gocnVsZSl9XyR7dWlkfWA7XG4gICAgY29uc3QgZG9jID0gbm9kZS5vd25lckRvY3VtZW50O1xuICAgIGFjdGl2ZV9kb2NzLmFkZChkb2MpO1xuICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBkb2MuX19zdmVsdGVfc3R5bGVzaGVldCB8fCAoZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQgPSBkb2MuaGVhZC5hcHBlbmRDaGlsZChlbGVtZW50KCdzdHlsZScpKS5zaGVldCk7XG4gICAgY29uc3QgY3VycmVudF9ydWxlcyA9IGRvYy5fX3N2ZWx0ZV9ydWxlcyB8fCAoZG9jLl9fc3ZlbHRlX3J1bGVzID0ge30pO1xuICAgIGlmICghY3VycmVudF9ydWxlc1tuYW1lXSkge1xuICAgICAgICBjdXJyZW50X3J1bGVzW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgc3R5bGVzaGVldC5pbnNlcnRSdWxlKGBAa2V5ZnJhbWVzICR7bmFtZX0gJHtydWxlfWAsIHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICB9XG4gICAgY29uc3QgYW5pbWF0aW9uID0gbm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJyc7XG4gICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBgJHthbmltYXRpb24gPyBgJHthbmltYXRpb259LCBgIDogJyd9JHtuYW1lfSAke2R1cmF0aW9ufW1zIGxpbmVhciAke2RlbGF5fW1zIDEgYm90aGA7XG4gICAgYWN0aXZlICs9IDE7XG4gICAgcmV0dXJuIG5hbWU7XG59XG5mdW5jdGlvbiBkZWxldGVfcnVsZShub2RlLCBuYW1lKSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSAobm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIGNvbnN0IG5leHQgPSBwcmV2aW91cy5maWx0ZXIobmFtZVxuICAgICAgICA/IGFuaW0gPT4gYW5pbS5pbmRleE9mKG5hbWUpIDwgMCAvLyByZW1vdmUgc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgICAgIDogYW5pbSA9PiBhbmltLmluZGV4T2YoJ19fc3ZlbHRlJykgPT09IC0xIC8vIHJlbW92ZSBhbGwgU3ZlbHRlIGFuaW1hdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBwcmV2aW91cy5sZW5ndGggLSBuZXh0Lmxlbmd0aDtcbiAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IG5leHQuam9pbignLCAnKTtcbiAgICAgICAgYWN0aXZlIC09IGRlbGV0ZWQ7XG4gICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgY2xlYXJfcnVsZXMoKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhcl9ydWxlcygpIHtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhY3RpdmVfZG9jcy5mb3JFYWNoKGRvYyA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdHlsZXNoZWV0ID0gZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQ7XG4gICAgICAgICAgICBsZXQgaSA9IHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGktLSlcbiAgICAgICAgICAgICAgICBzdHlsZXNoZWV0LmRlbGV0ZVJ1bGUoaSk7XG4gICAgICAgICAgICBkb2MuX19zdmVsdGVfcnVsZXMgPSB7fTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFjdGl2ZV9kb2NzLmNsZWFyKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZV9hbmltYXRpb24obm9kZSwgZnJvbSwgZm4sIHBhcmFtcykge1xuICAgIGlmICghZnJvbSlcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgY29uc3QgdG8gPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChmcm9tLmxlZnQgPT09IHRvLmxlZnQgJiYgZnJvbS5yaWdodCA9PT0gdG8ucmlnaHQgJiYgZnJvbS50b3AgPT09IHRvLnRvcCAmJiBmcm9tLmJvdHRvbSA9PT0gdG8uYm90dG9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86IHNob3VsZCB0aGlzIGJlIHNlcGFyYXRlZCBmcm9tIGRlc3RydWN0dXJpbmc/IE9yIHN0YXJ0L2VuZCBhZGRlZCB0byBwdWJsaWMgYXBpIGFuZCBkb2N1bWVudGF0aW9uP1xuICAgIHN0YXJ0OiBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheSwgXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOlxuICAgIGVuZCA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbiwgdGljayA9IG5vb3AsIGNzcyB9ID0gZm4obm9kZSwgeyBmcm9tLCB0byB9LCBwYXJhbXMpO1xuICAgIGxldCBydW5uaW5nID0gdHJ1ZTtcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIGxldCBuYW1lO1xuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICBuYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZWxheSkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpO1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgaWYgKCFzdGFydGVkICYmIG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnRlZCAmJiBub3cgPj0gZW5kKSB7XG4gICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gbm93IC0gc3RhcnRfdGltZTtcbiAgICAgICAgICAgIGNvbnN0IHQgPSAwICsgMSAqIGVhc2luZyhwIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgc3RhcnQoKTtcbiAgICB0aWNrKDAsIDEpO1xuICAgIHJldHVybiBzdG9wO1xufVxuZnVuY3Rpb24gZml4X3Bvc2l0aW9uKG5vZGUpIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKHN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnICYmIHN0eWxlLnBvc2l0aW9uICE9PSAnZml4ZWQnKSB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gc3R5bGU7XG4gICAgICAgIGNvbnN0IGEgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgbm9kZS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgYWRkX3RyYW5zZm9ybShub2RlLCBhKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpIHtcbiAgICBjb25zdCBiID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoYS5sZWZ0ICE9PSBiLmxlZnQgfHwgYS50b3AgIT09IGIudG9wKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbm9kZS5zdHlsZS50cmFuc2Zvcm0gPSBgJHt0cmFuc2Zvcm19IHRyYW5zbGF0ZSgke2EubGVmdCAtIGIubGVmdH1weCwgJHthLnRvcCAtIGIudG9wfXB4KWA7XG4gICAgfVxufVxuXG5sZXQgY3VycmVudF9jb21wb25lbnQ7XG5mdW5jdGlvbiBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgY3VycmVudF9jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBnZXRfY3VycmVudF9jb21wb25lbnQoKSB7XG4gICAgaWYgKCFjdXJyZW50X2NvbXBvbmVudClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb3V0c2lkZSBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24nKTtcbiAgICByZXR1cm4gY3VycmVudF9jb21wb25lbnQ7XG59XG5mdW5jdGlvbiBiZWZvcmVVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5iZWZvcmVfdXBkYXRlLnB1c2goZm4pO1xufVxuZnVuY3Rpb24gb25Nb3VudChmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX21vdW50LnB1c2goZm4pO1xufVxuZnVuY3Rpb24gYWZ0ZXJVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5hZnRlcl91cGRhdGUucHVzaChmbik7XG59XG5mdW5jdGlvbiBvbkRlc3Ryb3koZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9kZXN0cm95LnB1c2goZm4pO1xufVxuZnVuY3Rpb24gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCkge1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IGdldF9jdXJyZW50X2NvbXBvbmVudCgpO1xuICAgIHJldHVybiAodHlwZSwgZGV0YWlsKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbdHlwZV07XG4gICAgICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gYXJlIHRoZXJlIHNpdHVhdGlvbnMgd2hlcmUgZXZlbnRzIGNvdWxkIGJlIGRpc3BhdGNoZWRcbiAgICAgICAgICAgIC8vIGluIGEgc2VydmVyIChub24tRE9NKSBlbnZpcm9ubWVudD9cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCk7XG4gICAgICAgICAgICBjYWxsYmFja3Muc2xpY2UoKS5mb3JFYWNoKGZuID0+IHtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKGNvbXBvbmVudCwgZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gc2V0Q29udGV4dChrZXksIGNvbnRleHQpIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LnNldChrZXksIGNvbnRleHQpO1xufVxuZnVuY3Rpb24gZ2V0Q29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5nZXQoa2V5KTtcbn1cbi8vIFRPRE8gZmlndXJlIG91dCBpZiB3ZSBzdGlsbCB3YW50IHRvIHN1cHBvcnRcbi8vIHNob3J0aGFuZCBldmVudHMsIG9yIGlmIHdlIHdhbnQgdG8gaW1wbGVtZW50XG4vLyBhIHJlYWwgYnViYmxpbmcgbWVjaGFuaXNtXG5mdW5jdGlvbiBidWJibGUoY29tcG9uZW50LCBldmVudCkge1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbZXZlbnQudHlwZV07XG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICBjYWxsYmFja3Muc2xpY2UoKS5mb3JFYWNoKGZuID0+IGZuKGV2ZW50KSk7XG4gICAgfVxufVxuXG5jb25zdCBkaXJ0eV9jb21wb25lbnRzID0gW107XG5jb25zdCBpbnRyb3MgPSB7IGVuYWJsZWQ6IGZhbHNlIH07XG5jb25zdCBiaW5kaW5nX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgcmVuZGVyX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgZmx1c2hfY2FsbGJhY2tzID0gW107XG5jb25zdCByZXNvbHZlZF9wcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5sZXQgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuZnVuY3Rpb24gc2NoZWR1bGVfdXBkYXRlKCkge1xuICAgIGlmICghdXBkYXRlX3NjaGVkdWxlZCkge1xuICAgICAgICB1cGRhdGVfc2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZWRfcHJvbWlzZS50aGVuKGZsdXNoKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0aWNrKCkge1xuICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgIHJldHVybiByZXNvbHZlZF9wcm9taXNlO1xufVxuZnVuY3Rpb24gYWRkX3JlbmRlcl9jYWxsYmFjayhmbikge1xuICAgIHJlbmRlcl9jYWxsYmFja3MucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZGRfZmx1c2hfY2FsbGJhY2soZm4pIHtcbiAgICBmbHVzaF9jYWxsYmFja3MucHVzaChmbik7XG59XG5sZXQgZmx1c2hpbmcgPSBmYWxzZTtcbmNvbnN0IHNlZW5fY2FsbGJhY2tzID0gbmV3IFNldCgpO1xuZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgaWYgKGZsdXNoaW5nKVxuICAgICAgICByZXR1cm47XG4gICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgIGRvIHtcbiAgICAgICAgLy8gZmlyc3QsIGNhbGwgYmVmb3JlVXBkYXRlIGZ1bmN0aW9uc1xuICAgICAgICAvLyBhbmQgdXBkYXRlIGNvbXBvbmVudHNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBkaXJ0eV9jb21wb25lbnRzW2ldO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoY29tcG9uZW50LiQkKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoID0gMDtcbiAgICAgICAgd2hpbGUgKGJpbmRpbmdfY2FsbGJhY2tzLmxlbmd0aClcbiAgICAgICAgICAgIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgICAgIC8vIHRoZW4sIG9uY2UgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgY2FsbFxuICAgICAgICAvLyBhZnRlclVwZGF0ZSBmdW5jdGlvbnMuIFRoaXMgbWF5IGNhdXNlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gcmVuZGVyX2NhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICghc2Vlbl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICBzZWVuX2NhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIH0gd2hpbGUgKGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoKTtcbiAgICB3aGlsZSAoZmx1c2hfY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmbHVzaF9jYWxsYmFja3MucG9wKCkoKTtcbiAgICB9XG4gICAgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgc2Vlbl9jYWxsYmFja3MuY2xlYXIoKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZSgkJCkge1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAkJC51cGRhdGUoKTtcbiAgICAgICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAgICAgY29uc3QgZGlydHkgPSAkJC5kaXJ0eTtcbiAgICAgICAgJCQuZGlydHkgPSBbLTFdO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5wKCQkLmN0eCwgZGlydHkpO1xuICAgICAgICAkJC5hZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbiAgICB9XG59XG5cbmxldCBwcm9taXNlO1xuZnVuY3Rpb24gd2FpdCgpIHtcbiAgICBpZiAoIXByb21pc2UpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGRpc3BhdGNoKG5vZGUsIGRpcmVjdGlvbiwga2luZCkge1xuICAgIG5vZGUuZGlzcGF0Y2hFdmVudChjdXN0b21fZXZlbnQoYCR7ZGlyZWN0aW9uID8gJ2ludHJvJyA6ICdvdXRybyd9JHtraW5kfWApKTtcbn1cbmNvbnN0IG91dHJvaW5nID0gbmV3IFNldCgpO1xubGV0IG91dHJvcztcbmZ1bmN0aW9uIGdyb3VwX291dHJvcygpIHtcbiAgICBvdXRyb3MgPSB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGM6IFtdLFxuICAgICAgICBwOiBvdXRyb3MgLy8gcGFyZW50IGdyb3VwXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNoZWNrX291dHJvcygpIHtcbiAgICBpZiAoIW91dHJvcy5yKSB7XG4gICAgICAgIHJ1bl9hbGwob3V0cm9zLmMpO1xuICAgIH1cbiAgICBvdXRyb3MgPSBvdXRyb3MucDtcbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25faW4oYmxvY2ssIGxvY2FsKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLmkpIHtcbiAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgYmxvY2suaShsb2NhbCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9vdXQoYmxvY2ssIGxvY2FsLCBkZXRhY2gsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLm8pIHtcbiAgICAgICAgaWYgKG91dHJvaW5nLmhhcyhibG9jaykpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG91dHJvaW5nLmFkZChibG9jayk7XG4gICAgICAgIG91dHJvcy5jLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChkZXRhY2gpXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmQoMSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJsb2NrLm8obG9jYWwpO1xuICAgIH1cbn1cbmNvbnN0IG51bGxfdHJhbnNpdGlvbiA9IHsgZHVyYXRpb246IDAgfTtcbmZ1bmN0aW9uIGNyZWF0ZV9pbl90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IGZhbHNlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBsZXQgdGFzaztcbiAgICBsZXQgdWlkID0gMDtcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKCkge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzLCB1aWQrKyk7XG4gICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgaWYgKHRhc2spXG4gICAgICAgICAgICB0YXNrLmFib3J0KCk7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIHRydWUsICdzdGFydCcpKTtcbiAgICAgICAgdGFzayA9IGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBlbmRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCB0cnVlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQoKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlKTtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oZ28pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBjb25zdCBncm91cCA9IG91dHJvcztcbiAgICBncm91cC5yICs9IDE7XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDEsIDAsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdzdGFydCcpKTtcbiAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIGZhbHNlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghLS1ncm91cC5yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgcmVzdWx0IGluIGBlbmQoKWAgYmVpbmcgY2FsbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgbmVlZCB0byBjbGVhbiB1cCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKGdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEgLSB0LCB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnbygpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBlbmQocmVzZXQpIHtcbiAgICAgICAgICAgIGlmIChyZXNldCAmJiBjb25maWcudGljaykge1xuICAgICAgICAgICAgICAgIGNvbmZpZy50aWNrKDEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zLCBpbnRybykge1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMpO1xuICAgIGxldCB0ID0gaW50cm8gPyAwIDogMTtcbiAgICBsZXQgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWUgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGNsZWFyX2FuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbml0KHByb2dyYW0sIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGQgPSBwcm9ncmFtLmIgLSB0O1xuICAgICAgICBkdXJhdGlvbiAqPSBNYXRoLmFicyhkKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGE6IHQsXG4gICAgICAgICAgICBiOiBwcm9ncmFtLmIsXG4gICAgICAgICAgICBkLFxuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICBzdGFydDogcHJvZ3JhbS5zdGFydCxcbiAgICAgICAgICAgIGVuZDogcHJvZ3JhbS5zdGFydCArIGR1cmF0aW9uLFxuICAgICAgICAgICAgZ3JvdXA6IHByb2dyYW0uZ3JvdXBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ28oYikge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBjb25zdCBwcm9ncmFtID0ge1xuICAgICAgICAgICAgc3RhcnQ6IG5vdygpICsgZGVsYXksXG4gICAgICAgICAgICBiXG4gICAgICAgIH07XG4gICAgICAgIGlmICghYikge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIHByb2dyYW0uZ3JvdXAgPSBvdXRyb3M7XG4gICAgICAgICAgICBvdXRyb3MuciArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0gfHwgcGVuZGluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICBwZW5kaW5nX3Byb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhpcyBpcyBhbiBpbnRybywgYW5kIHRoZXJlJ3MgYSBkZWxheSwgd2UgbmVlZCB0byBkb1xuICAgICAgICAgICAgLy8gYW4gaW5pdGlhbCB0aWNrIGFuZC9vciBhcHBseSBDU1MgYW5pbWF0aW9uIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCB0LCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiKVxuICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBpbml0KHByb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgYiwgJ3N0YXJ0JykpO1xuICAgICAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwZW5kaW5nX3Byb2dyYW0gJiYgbm93ID4gcGVuZGluZ19wcm9ncmFtLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocGVuZGluZ19wcm9ncmFtLCBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnc3RhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIHJ1bm5pbmdfcHJvZ3JhbS5iLCBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24sIDAsIGVhc2luZywgY29uZmlnLmNzcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2sodCA9IHJ1bm5pbmdfcHJvZ3JhbS5iLCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCBydW5uaW5nX3Byb2dyYW0uYiwgJ2VuZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwZW5kaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkb25lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbS5iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGludHJvIOKAlCB3ZSBjYW4gdGlkeSB1cCBpbW1lZGlhdGVseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG91dHJvIOKAlCBuZWVkcyB0byBiZSBjb29yZGluYXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIS0tcnVubmluZ19wcm9ncmFtLmdyb3VwLnIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKHJ1bm5pbmdfcHJvZ3JhbS5ncm91cC5jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vdyA+PSBydW5uaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBub3cgLSBydW5uaW5nX3Byb2dyYW0uc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ID0gcnVubmluZ19wcm9ncmFtLmEgKyBydW5uaW5nX3Byb2dyYW0uZCAqIGVhc2luZyhwIC8gcnVubmluZ19wcm9ncmFtLmR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2sodCwgMSAtIHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhIShydW5uaW5nX3Byb2dyYW0gfHwgcGVuZGluZ19wcm9ncmFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHJ1bihiKSB7XG4gICAgICAgICAgICBpZiAoaXNfZnVuY3Rpb24oY29uZmlnKSkge1xuICAgICAgICAgICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgZ28oYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlX3Byb21pc2UocHJvbWlzZSwgaW5mbykge1xuICAgIGNvbnN0IHRva2VuID0gaW5mby50b2tlbiA9IHt9O1xuICAgIGZ1bmN0aW9uIHVwZGF0ZSh0eXBlLCBpbmRleCwga2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoaW5mby50b2tlbiAhPT0gdG9rZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSB2YWx1ZTtcbiAgICAgICAgbGV0IGNoaWxkX2N0eCA9IGluZm8uY3R4O1xuICAgICAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoaWxkX2N0eCA9IGNoaWxkX2N0eC5zbGljZSgpO1xuICAgICAgICAgICAgY2hpbGRfY3R4W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBibG9jayA9IHR5cGUgJiYgKGluZm8uY3VycmVudCA9IHR5cGUpKGNoaWxkX2N0eCk7XG4gICAgICAgIGxldCBuZWVkc19mbHVzaCA9IGZhbHNlO1xuICAgICAgICBpZiAoaW5mby5ibG9jaykge1xuICAgICAgICAgICAgaWYgKGluZm8uYmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgaW5mby5ibG9ja3MuZm9yRWFjaCgoYmxvY2ssIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGluZGV4ICYmIGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cF9vdXRyb3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5ibG9ja3NbaV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja19vdXRyb3MoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5mby5ibG9jay5kKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmxvY2suYygpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihibG9jaywgMSk7XG4gICAgICAgICAgICBibG9jay5tKGluZm8ubW91bnQoKSwgaW5mby5hbmNob3IpO1xuICAgICAgICAgICAgbmVlZHNfZmx1c2ggPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8uYmxvY2sgPSBibG9jaztcbiAgICAgICAgaWYgKGluZm8uYmxvY2tzKVxuICAgICAgICAgICAgaW5mby5ibG9ja3NbaW5kZXhdID0gYmxvY2s7XG4gICAgICAgIGlmIChuZWVkc19mbHVzaCkge1xuICAgICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNfcHJvbWlzZShwcm9taXNlKSkge1xuICAgICAgICBjb25zdCBjdXJyZW50X2NvbXBvbmVudCA9IGdldF9jdXJyZW50X2NvbXBvbmVudCgpO1xuICAgICAgICBwcm9taXNlLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGN1cnJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnRoZW4sIDEsIGluZm8udmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGN1cnJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLmNhdGNoLCAyLCBpbmZvLmVycm9yLCBlcnJvcik7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgICAgICBpZiAoIWluZm8uaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGlmIHdlIHByZXZpb3VzbHkgaGFkIGEgdGhlbi9jYXRjaCBibG9jaywgZGVzdHJveSBpdFxuICAgICAgICBpZiAoaW5mby5jdXJyZW50ICE9PSBpbmZvLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnBlbmRpbmcsIDApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8udGhlbikge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvLnJlc29sdmVkID0gcHJvbWlzZTtcbiAgICB9XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gZ2xvYmFsVGhpc1xuICAgICAgICA6IGdsb2JhbCk7XG5cbmZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmQoMSk7XG4gICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xufVxuZnVuY3Rpb24gb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiB1cGRhdGVfa2V5ZWRfZWFjaChvbGRfYmxvY2tzLCBkaXJ0eSwgZ2V0X2tleSwgZHluYW1pYywgY3R4LCBsaXN0LCBsb29rdXAsIG5vZGUsIGRlc3Ryb3ksIGNyZWF0ZV9lYWNoX2Jsb2NrLCBuZXh0LCBnZXRfY29udGV4dCkge1xuICAgIGxldCBvID0gb2xkX2Jsb2Nrcy5sZW5ndGg7XG4gICAgbGV0IG4gPSBsaXN0Lmxlbmd0aDtcbiAgICBsZXQgaSA9IG87XG4gICAgY29uc3Qgb2xkX2luZGV4ZXMgPSB7fTtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBvbGRfaW5kZXhlc1tvbGRfYmxvY2tzW2ldLmtleV0gPSBpO1xuICAgIGNvbnN0IG5ld19ibG9ja3MgPSBbXTtcbiAgICBjb25zdCBuZXdfbG9va3VwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGRlbHRhcyA9IG5ldyBNYXAoKTtcbiAgICBpID0gbjtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkX2N0eCA9IGdldF9jb250ZXh0KGN0eCwgbGlzdCwgaSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IGJsb2NrID0gbG9va3VwLmdldChrZXkpO1xuICAgICAgICBpZiAoIWJsb2NrKSB7XG4gICAgICAgICAgICBibG9jayA9IGNyZWF0ZV9lYWNoX2Jsb2NrKGtleSwgY2hpbGRfY3R4KTtcbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkeW5hbWljKSB7XG4gICAgICAgICAgICBibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpO1xuICAgICAgICB9XG4gICAgICAgIG5ld19sb29rdXAuc2V0KGtleSwgbmV3X2Jsb2Nrc1tpXSA9IGJsb2NrKTtcbiAgICAgICAgaWYgKGtleSBpbiBvbGRfaW5kZXhlcylcbiAgICAgICAgICAgIGRlbHRhcy5zZXQoa2V5LCBNYXRoLmFicyhpIC0gb2xkX2luZGV4ZXNba2V5XSkpO1xuICAgIH1cbiAgICBjb25zdCB3aWxsX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgZGlkX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gaW5zZXJ0KGJsb2NrKSB7XG4gICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICBibG9jay5tKG5vZGUsIG5leHQpO1xuICAgICAgICBsb29rdXAuc2V0KGJsb2NrLmtleSwgYmxvY2spO1xuICAgICAgICBuZXh0ID0gYmxvY2suZmlyc3Q7XG4gICAgICAgIG4tLTtcbiAgICB9XG4gICAgd2hpbGUgKG8gJiYgbikge1xuICAgICAgICBjb25zdCBuZXdfYmxvY2sgPSBuZXdfYmxvY2tzW24gLSAxXTtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvIC0gMV07XG4gICAgICAgIGNvbnN0IG5ld19rZXkgPSBuZXdfYmxvY2sua2V5O1xuICAgICAgICBjb25zdCBvbGRfa2V5ID0gb2xkX2Jsb2NrLmtleTtcbiAgICAgICAgaWYgKG5ld19ibG9jayA9PT0gb2xkX2Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBuZXh0ID0gbmV3X2Jsb2NrLmZpcnN0O1xuICAgICAgICAgICAgby0tO1xuICAgICAgICAgICAgbi0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIG9sZCBibG9ja1xuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWxvb2t1cC5oYXMobmV3X2tleSkgfHwgd2lsbF9tb3ZlLmhhcyhuZXdfa2V5KSkge1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlkX21vdmUuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVsdGFzLmdldChuZXdfa2V5KSA+IGRlbHRhcy5nZXQob2xkX2tleSkpIHtcbiAgICAgICAgICAgIGRpZF9tb3ZlLmFkZChuZXdfa2V5KTtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2lsbF9tb3ZlLmFkZChvbGRfa2V5KTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoby0tKSB7XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3Nbb107XG4gICAgICAgIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2Jsb2NrLmtleSkpXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICB9XG4gICAgd2hpbGUgKG4pXG4gICAgICAgIGluc2VydChuZXdfYmxvY2tzW24gLSAxXSk7XG4gICAgcmV0dXJuIG5ld19ibG9ja3M7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2tleXMoY3R4LCBsaXN0LCBnZXRfY29udGV4dCwgZ2V0X2tleSkge1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKSk7XG4gICAgICAgIGlmIChrZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIGR1cGxpY2F0ZSBrZXlzIGluIGEga2V5ZWQgZWFjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRfc3ByZWFkX3VwZGF0ZShsZXZlbHMsIHVwZGF0ZXMpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICBjb25zdCB0b19udWxsX291dCA9IHt9O1xuICAgIGNvbnN0IGFjY291bnRlZF9mb3IgPSB7ICQkc2NvcGU6IDEgfTtcbiAgICBsZXQgaSA9IGxldmVscy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBvID0gbGV2ZWxzW2ldO1xuICAgICAgICBjb25zdCBuID0gdXBkYXRlc1tpXTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gbikpXG4gICAgICAgICAgICAgICAgICAgIHRvX251bGxfb3V0W2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbikge1xuICAgICAgICAgICAgICAgIGlmICghYWNjb3VudGVkX2ZvcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gbltrZXldO1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsc1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0b19udWxsX291dCkge1xuICAgICAgICBpZiAoIShrZXkgaW4gdXBkYXRlKSlcbiAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlO1xufVxuZnVuY3Rpb24gZ2V0X3NwcmVhZF9vYmplY3Qoc3ByZWFkX3Byb3BzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzcHJlYWRfcHJvcHMgPT09ICdvYmplY3QnICYmIHNwcmVhZF9wcm9wcyAhPT0gbnVsbCA/IHNwcmVhZF9wcm9wcyA6IHt9O1xufVxuXG4vLyBzb3VyY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZGljZXMuaHRtbFxuY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbXG4gICAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICAgJ2FsbG93cGF5bWVudHJlcXVlc3QnLFxuICAgICdhc3luYycsXG4gICAgJ2F1dG9mb2N1cycsXG4gICAgJ2F1dG9wbGF5JyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ2NvbnRyb2xzJyxcbiAgICAnZGVmYXVsdCcsXG4gICAgJ2RlZmVyJyxcbiAgICAnZGlzYWJsZWQnLFxuICAgICdmb3Jtbm92YWxpZGF0ZScsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2lzbWFwJyxcbiAgICAnbG9vcCcsXG4gICAgJ211bHRpcGxlJyxcbiAgICAnbXV0ZWQnLFxuICAgICdub21vZHVsZScsXG4gICAgJ25vdmFsaWRhdGUnLFxuICAgICdvcGVuJyxcbiAgICAncGxheXNpbmxpbmUnLFxuICAgICdyZWFkb25seScsXG4gICAgJ3JlcXVpcmVkJyxcbiAgICAncmV2ZXJzZWQnLFxuICAgICdzZWxlY3RlZCdcbl0pO1xuXG5jb25zdCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciA9IC9bXFxzJ1wiPi89XFx1e0ZERDB9LVxcdXtGREVGfVxcdXtGRkZFfVxcdXtGRkZGfVxcdXsxRkZGRX1cXHV7MUZGRkZ9XFx1ezJGRkZFfVxcdXsyRkZGRn1cXHV7M0ZGRkV9XFx1ezNGRkZGfVxcdXs0RkZGRX1cXHV7NEZGRkZ9XFx1ezVGRkZFfVxcdXs1RkZGRn1cXHV7NkZGRkV9XFx1ezZGRkZGfVxcdXs3RkZGRX1cXHV7N0ZGRkZ9XFx1ezhGRkZFfVxcdXs4RkZGRn1cXHV7OUZGRkV9XFx1ezlGRkZGfVxcdXtBRkZGRX1cXHV7QUZGRkZ9XFx1e0JGRkZFfVxcdXtCRkZGRn1cXHV7Q0ZGRkV9XFx1e0NGRkZGfVxcdXtERkZGRX1cXHV7REZGRkZ9XFx1e0VGRkZFfVxcdXtFRkZGRn1cXHV7RkZGRkV9XFx1e0ZGRkZGfVxcdXsxMEZGRkV9XFx1ezEwRkZGRn1dL3U7XG4vLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGVzLTJcbi8vIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNub25jaGFyYWN0ZXJcbmZ1bmN0aW9uIHNwcmVhZChhcmdzLCBjbGFzc2VzX3RvX2FkZCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5hcmdzKTtcbiAgICBpZiAoY2xhc3Nlc190b19hZGQpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuY2xhc3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyArPSAnICcgKyBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3RyID0gJyc7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLnRlc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciArPSBgICR7bmFtZX09XCIke1N0cmluZyh2YWx1ZSkucmVwbGFjZSgvXCIvZywgJyYjMzQ7JykucmVwbGFjZSgvJy9nLCAnJiMzOTsnKX1cImA7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgZXNjYXBlZCA9IHtcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0Oydcbn07XG5mdW5jdGlvbiBlc2NhcGUoaHRtbCkge1xuICAgIHJldHVybiBTdHJpbmcoaHRtbCkucmVwbGFjZSgvW1wiJyY8Pl0vZywgbWF0Y2ggPT4gZXNjYXBlZFttYXRjaF0pO1xufVxuZnVuY3Rpb24gZWFjaChpdGVtcywgZm4pIHtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdHIgKz0gZm4oaXRlbXNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgbWlzc2luZ19jb21wb25lbnQgPSB7XG4gICAgJCRyZW5kZXI6ICgpID0+ICcnXG59O1xuZnVuY3Rpb24gdmFsaWRhdGVfY29tcG9uZW50KGNvbXBvbmVudCwgbmFtZSkge1xuICAgIGlmICghY29tcG9uZW50IHx8ICFjb21wb25lbnQuJCRyZW5kZXIpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdzdmVsdGU6Y29tcG9uZW50JylcbiAgICAgICAgICAgIG5hbWUgKz0gJyB0aGlzPXsuLi59JztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8JHtuYW1lfT4gaXMgbm90IGEgdmFsaWQgU1NSIGNvbXBvbmVudC4gWW91IG1heSBuZWVkIHRvIHJldmlldyB5b3VyIGJ1aWxkIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBkZXBlbmRlbmNpZXMgYXJlIGNvbXBpbGVkLCByYXRoZXIgdGhhbiBpbXBvcnRlZCBhcyBwcmUtY29tcGlsZWQgbW9kdWxlc2ApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZGVidWcoZmlsZSwgbGluZSwgY29sdW1uLCB2YWx1ZXMpIHtcbiAgICBjb25zb2xlLmxvZyhge0BkZWJ1Z30gJHtmaWxlID8gZmlsZSArICcgJyA6ICcnfSgke2xpbmV9OiR7Y29sdW1ufSlgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2codmFsdWVzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgcmV0dXJuICcnO1xufVxubGV0IG9uX2Rlc3Ryb3k7XG5mdW5jdGlvbiBjcmVhdGVfc3NyX2NvbXBvbmVudChmbikge1xuICAgIGZ1bmN0aW9uICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cykge1xuICAgICAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgICAgIGNvbnN0ICQkID0ge1xuICAgICAgICAgICAgb25fZGVzdHJveSxcbiAgICAgICAgICAgIGNvbnRleHQ6IG5ldyBNYXAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSxcbiAgICAgICAgICAgIC8vIHRoZXNlIHdpbGwgYmUgaW1tZWRpYXRlbHkgZGlzY2FyZGVkXG4gICAgICAgICAgICBvbl9tb3VudDogW10sXG4gICAgICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGFmdGVyX3VwZGF0ZTogW10sXG4gICAgICAgICAgICBjYWxsYmFja3M6IGJsYW5rX29iamVjdCgpXG4gICAgICAgIH07XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudCh7ICQkIH0pO1xuICAgICAgICBjb25zdCBodG1sID0gZm4ocmVzdWx0LCBwcm9wcywgYmluZGluZ3MsIHNsb3RzKTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyOiAocHJvcHMgPSB7fSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgICAgICAgICBvbl9kZXN0cm95ID0gW107XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7IHRpdGxlOiAnJywgaGVhZDogJycsIGNzczogbmV3IFNldCgpIH07XG4gICAgICAgICAgICBjb25zdCBodG1sID0gJCRyZW5kZXIocmVzdWx0LCBwcm9wcywge30sIG9wdGlvbnMpO1xuICAgICAgICAgICAgcnVuX2FsbChvbl9kZXN0cm95KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaHRtbCxcbiAgICAgICAgICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogQXJyYXkuZnJvbShyZXN1bHQuY3NzKS5tYXAoY3NzID0+IGNzcy5jb2RlKS5qb2luKCdcXG4nKSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBudWxsIC8vIFRPRE9cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGhlYWQ6IHJlc3VsdC50aXRsZSArIHJlc3VsdC5oZWFkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAkJHJlbmRlclxuICAgIH07XG59XG5mdW5jdGlvbiBhZGRfYXR0cmlidXRlKG5hbWUsIHZhbHVlLCBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwgfHwgKGJvb2xlYW4gJiYgIXZhbHVlKSlcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIHJldHVybiBgICR7bmFtZX0ke3ZhbHVlID09PSB0cnVlID8gJycgOiBgPSR7dHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04uc3RyaW5naWZ5KGVzY2FwZSh2YWx1ZSkpIDogYFwiJHt2YWx1ZX1cImB9YH1gO1xufVxuZnVuY3Rpb24gYWRkX2NsYXNzZXMoY2xhc3Nlcykge1xuICAgIHJldHVybiBjbGFzc2VzID8gYCBjbGFzcz1cIiR7Y2xhc3Nlc31cImAgOiAnJztcbn1cblxuZnVuY3Rpb24gYmluZChjb21wb25lbnQsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaW5kZXggPSBjb21wb25lbnQuJCQucHJvcHNbbmFtZV07XG4gICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcG9uZW50LiQkLmJvdW5kW2luZGV4XSA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayhjb21wb25lbnQuJCQuY3R4W2luZGV4XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlX2NvbXBvbmVudChibG9jaykge1xuICAgIGJsb2NrICYmIGJsb2NrLmMoKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2NvbXBvbmVudChibG9jaywgcGFyZW50X25vZGVzKSB7XG4gICAgYmxvY2sgJiYgYmxvY2subChwYXJlbnRfbm9kZXMpO1xufVxuZnVuY3Rpb24gbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgdGFyZ2V0LCBhbmNob3IpIHtcbiAgICBjb25zdCB7IGZyYWdtZW50LCBvbl9tb3VudCwgb25fZGVzdHJveSwgYWZ0ZXJfdXBkYXRlIH0gPSBjb21wb25lbnQuJCQ7XG4gICAgZnJhZ21lbnQgJiYgZnJhZ21lbnQubSh0YXJnZXQsIGFuY2hvcik7XG4gICAgLy8gb25Nb3VudCBoYXBwZW5zIGJlZm9yZSB0aGUgaW5pdGlhbCBhZnRlclVwZGF0ZVxuICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdfb25fZGVzdHJveSA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgIGlmIChvbl9kZXN0cm95KSB7XG4gICAgICAgICAgICBvbl9kZXN0cm95LnB1c2goLi4ubmV3X29uX2Rlc3Ryb3kpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gRWRnZSBjYXNlIC0gY29tcG9uZW50IHdhcyBkZXN0cm95ZWQgaW1tZWRpYXRlbHksXG4gICAgICAgICAgICAvLyBtb3N0IGxpa2VseSBhcyBhIHJlc3VsdCBvZiBhIGJpbmRpbmcgaW5pdGlhbGlzaW5nXG4gICAgICAgICAgICBydW5fYWxsKG5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnQuJCQub25fbW91bnQgPSBbXTtcbiAgICB9KTtcbiAgICBhZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3lfY29tcG9uZW50KGNvbXBvbmVudCwgZGV0YWNoaW5nKSB7XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQ7XG4gICAgaWYgKCQkLmZyYWdtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHJ1bl9hbGwoJCQub25fZGVzdHJveSk7XG4gICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LmQoZGV0YWNoaW5nKTtcbiAgICAgICAgLy8gVE9ETyBudWxsIG91dCBvdGhlciByZWZzLCBpbmNsdWRpbmcgY29tcG9uZW50LiQkIChidXQgbmVlZCB0b1xuICAgICAgICAvLyBwcmVzZXJ2ZSBmaW5hbCBzdGF0ZT8pXG4gICAgICAgICQkLm9uX2Rlc3Ryb3kgPSAkJC5mcmFnbWVudCA9IG51bGw7XG4gICAgICAgICQkLmN0eCA9IFtdO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1ha2VfZGlydHkoY29tcG9uZW50LCBpKSB7XG4gICAgaWYgKGNvbXBvbmVudC4kJC5kaXJ0eVswXSA9PT0gLTEpIHtcbiAgICAgICAgZGlydHlfY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgICAgICBjb21wb25lbnQuJCQuZGlydHkuZmlsbCgwKTtcbiAgICB9XG4gICAgY29tcG9uZW50LiQkLmRpcnR5WyhpIC8gMzEpIHwgMF0gfD0gKDEgPDwgKGkgJSAzMSkpO1xufVxuZnVuY3Rpb24gaW5pdChjb21wb25lbnQsIG9wdGlvbnMsIGluc3RhbmNlLCBjcmVhdGVfZnJhZ21lbnQsIG5vdF9lcXVhbCwgcHJvcHMsIGRpcnR5ID0gWy0xXSkge1xuICAgIGNvbnN0IHBhcmVudF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcbiAgICBjb25zdCBwcm9wX3ZhbHVlcyA9IG9wdGlvbnMucHJvcHMgfHwge307XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQgPSB7XG4gICAgICAgIGZyYWdtZW50OiBudWxsLFxuICAgICAgICBjdHg6IG51bGwsXG4gICAgICAgIC8vIHN0YXRlXG4gICAgICAgIHByb3BzLFxuICAgICAgICB1cGRhdGU6IG5vb3AsXG4gICAgICAgIG5vdF9lcXVhbCxcbiAgICAgICAgYm91bmQ6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICAvLyBsaWZlY3ljbGVcbiAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICBvbl9kZXN0cm95OiBbXSxcbiAgICAgICAgYmVmb3JlX3VwZGF0ZTogW10sXG4gICAgICAgIGFmdGVyX3VwZGF0ZTogW10sXG4gICAgICAgIGNvbnRleHQ6IG5ldyBNYXAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSxcbiAgICAgICAgLy8gZXZlcnl0aGluZyBlbHNlXG4gICAgICAgIGNhbGxiYWNrczogYmxhbmtfb2JqZWN0KCksXG4gICAgICAgIGRpcnR5LFxuICAgICAgICBza2lwX2JvdW5kOiBmYWxzZVxuICAgIH07XG4gICAgbGV0IHJlYWR5ID0gZmFsc2U7XG4gICAgJCQuY3R4ID0gaW5zdGFuY2VcbiAgICAgICAgPyBpbnN0YW5jZShjb21wb25lbnQsIHByb3BfdmFsdWVzLCAoaSwgcmV0LCAuLi5yZXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlc3QubGVuZ3RoID8gcmVzdFswXSA6IHJldDtcbiAgICAgICAgICAgIGlmICgkJC5jdHggJiYgbm90X2VxdWFsKCQkLmN0eFtpXSwgJCQuY3R4W2ldID0gdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkJC5za2lwX2JvdW5kICYmICQkLmJvdW5kW2ldKVxuICAgICAgICAgICAgICAgICAgICAkJC5ib3VuZFtpXSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KVxuICAgICAgICAgICAgICAgICAgICBtYWtlX2RpcnR5KGNvbXBvbmVudCwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9KVxuICAgICAgICA6IFtdO1xuICAgICQkLnVwZGF0ZSgpO1xuICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICBydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuICAgIC8vIGBmYWxzZWAgYXMgYSBzcGVjaWFsIGNhc2Ugb2Ygbm8gRE9NIGNvbXBvbmVudFxuICAgICQkLmZyYWdtZW50ID0gY3JlYXRlX2ZyYWdtZW50ID8gY3JlYXRlX2ZyYWdtZW50KCQkLmN0eCkgOiBmYWxzZTtcbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaHlkcmF0ZSkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjaGlsZHJlbihvcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQubChub2Rlcyk7XG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGRldGFjaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuYygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmludHJvKVxuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihjb21wb25lbnQuJCQuZnJhZ21lbnQpO1xuICAgICAgICBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IpO1xuICAgICAgICBmbHVzaCgpO1xuICAgIH1cbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG59XG5sZXQgU3ZlbHRlRWxlbWVudDtcbmlmICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBTdmVsdGVFbGVtZW50ID0gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuJCQuc2xvdHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLiQkLnNsb3R0ZWRba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIF9vbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXNbYXR0cl0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUT0RPIHNob3VsZCB0aGlzIGRlbGVnYXRlIHRvIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICB9XG4gICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSB8fCAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gPSBbXSkpO1xuICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICBpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkoJCRwcm9wcykpIHtcbiAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoX2Rldih0eXBlLCBkZXRhaWwpIHtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudCh0eXBlLCBPYmplY3QuYXNzaWduKHsgdmVyc2lvbjogJzMuMjkuNCcgfSwgZGV0YWlsKSkpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZCh0YXJnZXQsIG5vZGUpO1xufVxuZnVuY3Rpb24gaW5zZXJ0X2Rldih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUsIGFuY2hvciB9KTtcbiAgICBpbnNlcnQodGFyZ2V0LCBub2RlLCBhbmNob3IpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2Rldihub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmUnLCB7IG5vZGUgfSk7XG4gICAgZGV0YWNoKG5vZGUpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2JldHdlZW5fZGV2KGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nICYmIGJlZm9yZS5uZXh0U2libGluZyAhPT0gYWZ0ZXIpIHtcbiAgICAgICAgZGV0YWNoX2RldihiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9iZWZvcmVfZGV2KGFmdGVyKSB7XG4gICAgd2hpbGUgKGFmdGVyLnByZXZpb3VzU2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGFmdGVyLnByZXZpb3VzU2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoX2FmdGVyX2RldihiZWZvcmUpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsaXN0ZW5fZGV2KG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zLCBoYXNfcHJldmVudF9kZWZhdWx0LCBoYXNfc3RvcF9wcm9wYWdhdGlvbikge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IG9wdGlvbnMgPT09IHRydWUgPyBbJ2NhcHR1cmUnXSA6IG9wdGlvbnMgPyBBcnJheS5mcm9tKE9iamVjdC5rZXlzKG9wdGlvbnMpKSA6IFtdO1xuICAgIGlmIChoYXNfcHJldmVudF9kZWZhdWx0KVxuICAgICAgICBtb2RpZmllcnMucHVzaCgncHJldmVudERlZmF1bHQnKTtcbiAgICBpZiAoaGFzX3N0b3BfcHJvcGFnYXRpb24pXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdzdG9wUHJvcGFnYXRpb24nKTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUFkZEV2ZW50TGlzdGVuZXInLCB7IG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBtb2RpZmllcnMgfSk7XG4gICAgY29uc3QgZGlzcG9zZSA9IGxpc3Rlbihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHJfZGV2KG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZUF0dHJpYnV0ZScsIHsgbm9kZSwgYXR0cmlidXRlIH0pO1xuICAgIGVsc2VcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXRBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBwcm9wX2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0UHJvcGVydHknLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIGRhdGFzZXRfZGV2KG5vZGUsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIG5vZGUuZGF0YXNldFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGFzZXQnLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhX2Rldih0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgPT09IGRhdGEpXG4gICAgICAgIHJldHVybjtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGEnLCB7IG5vZGU6IHRleHQsIGRhdGEgfSk7XG4gICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2VhY2hfYXJndW1lbnQoYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnICYmICEoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmICdsZW5ndGgnIGluIGFyZykpIHtcbiAgICAgICAgbGV0IG1zZyA9ICd7I2VhY2h9IG9ubHkgaXRlcmF0ZXMgb3ZlciBhcnJheS1saWtlIG9iamVjdHMuJztcbiAgICAgICAgaWYgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgYXJnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBhcmcpIHtcbiAgICAgICAgICAgIG1zZyArPSAnIFlvdSBjYW4gdXNlIGEgc3ByZWFkIHRvIGNvbnZlcnQgdGhpcyBpdGVyYWJsZSBpbnRvIGFuIGFycmF5Lic7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVfc2xvdHMobmFtZSwgc2xvdCwga2V5cykge1xuICAgIGZvciAoY29uc3Qgc2xvdF9rZXkgb2YgT2JqZWN0LmtleXMoc2xvdCkpIHtcbiAgICAgICAgaWYgKCF+a2V5cy5pbmRleE9mKHNsb3Rfa2V5KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGA8JHtuYW1lfT4gcmVjZWl2ZWQgYW4gdW5leHBlY3RlZCBzbG90IFwiJHtzbG90X2tleX1cIi5gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudERldiBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMgfHwgKCFvcHRpb25zLnRhcmdldCAmJiAhb3B0aW9ucy4kJGlubGluZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIid0YXJnZXQnIGlzIGEgcmVxdWlyZWQgb3B0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgICRkZXN0cm95KCkge1xuICAgICAgICBzdXBlci4kZGVzdHJveSgpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb21wb25lbnQgd2FzIGFscmVhZHkgZGVzdHJveWVkJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAkY2FwdHVyZV9zdGF0ZSgpIHsgfVxuICAgICRpbmplY3Rfc3RhdGUoKSB7IH1cbn1cbmZ1bmN0aW9uIGxvb3BfZ3VhcmQodGltZW91dCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gdGltZW91dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIGRldGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgeyBIdG1sVGFnLCBTdmVsdGVDb21wb25lbnQsIFN2ZWx0ZUNvbXBvbmVudERldiwgU3ZlbHRlRWxlbWVudCwgYWN0aW9uX2Rlc3Ryb3llciwgYWRkX2F0dHJpYnV0ZSwgYWRkX2NsYXNzZXMsIGFkZF9mbHVzaF9jYWxsYmFjaywgYWRkX2xvY2F0aW9uLCBhZGRfcmVuZGVyX2NhbGxiYWNrLCBhZGRfcmVzaXplX2xpc3RlbmVyLCBhZGRfdHJhbnNmb3JtLCBhZnRlclVwZGF0ZSwgYXBwZW5kLCBhcHBlbmRfZGV2LCBhc3NpZ24sIGF0dHIsIGF0dHJfZGV2LCBiZWZvcmVVcGRhdGUsIGJpbmQsIGJpbmRpbmdfY2FsbGJhY2tzLCBibGFua19vYmplY3QsIGJ1YmJsZSwgY2hlY2tfb3V0cm9zLCBjaGlsZHJlbiwgY2xhaW1fY29tcG9uZW50LCBjbGFpbV9lbGVtZW50LCBjbGFpbV9zcGFjZSwgY2xhaW1fdGV4dCwgY2xlYXJfbG9vcHMsIGNvbXBvbmVudF9zdWJzY3JpYmUsIGNvbXB1dGVfcmVzdF9wcm9wcywgY29tcHV0ZV9zbG90cywgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBjcmVhdGVfYW5pbWF0aW9uLCBjcmVhdGVfYmlkaXJlY3Rpb25hbF90cmFuc2l0aW9uLCBjcmVhdGVfY29tcG9uZW50LCBjcmVhdGVfaW5fdHJhbnNpdGlvbiwgY3JlYXRlX291dF90cmFuc2l0aW9uLCBjcmVhdGVfc2xvdCwgY3JlYXRlX3Nzcl9jb21wb25lbnQsIGN1cnJlbnRfY29tcG9uZW50LCBjdXN0b21fZXZlbnQsIGRhdGFzZXRfZGV2LCBkZWJ1ZywgZGVzdHJveV9ibG9jaywgZGVzdHJveV9jb21wb25lbnQsIGRlc3Ryb3lfZWFjaCwgZGV0YWNoLCBkZXRhY2hfYWZ0ZXJfZGV2LCBkZXRhY2hfYmVmb3JlX2RldiwgZGV0YWNoX2JldHdlZW5fZGV2LCBkZXRhY2hfZGV2LCBkaXJ0eV9jb21wb25lbnRzLCBkaXNwYXRjaF9kZXYsIGVhY2gsIGVsZW1lbnQsIGVsZW1lbnRfaXMsIGVtcHR5LCBlc2NhcGUsIGVzY2FwZWQsIGV4Y2x1ZGVfaW50ZXJuYWxfcHJvcHMsIGZpeF9hbmRfZGVzdHJveV9ibG9jaywgZml4X2FuZF9vdXRyb19hbmRfZGVzdHJveV9ibG9jaywgZml4X3Bvc2l0aW9uLCBmbHVzaCwgZ2V0Q29udGV4dCwgZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUsIGdldF9jdXJyZW50X2NvbXBvbmVudCwgZ2V0X3Nsb3RfY2hhbmdlcywgZ2V0X3Nsb3RfY29udGV4dCwgZ2V0X3NwcmVhZF9vYmplY3QsIGdldF9zcHJlYWRfdXBkYXRlLCBnZXRfc3RvcmVfdmFsdWUsIGdsb2JhbHMsIGdyb3VwX291dHJvcywgaGFuZGxlX3Byb21pc2UsIGhhc19wcm9wLCBpZGVudGl0eSwgaW5pdCwgaW5zZXJ0LCBpbnNlcnRfZGV2LCBpbnRyb3MsIGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLCBpc19jbGllbnQsIGlzX2Nyb3Nzb3JpZ2luLCBpc19lbXB0eSwgaXNfZnVuY3Rpb24sIGlzX3Byb21pc2UsIGxpc3RlbiwgbGlzdGVuX2RldiwgbG9vcCwgbG9vcF9ndWFyZCwgbWlzc2luZ19jb21wb25lbnQsIG1vdW50X2NvbXBvbmVudCwgbm9vcCwgbm90X2VxdWFsLCBub3csIG51bGxfdG9fZW1wdHksIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMsIG9uRGVzdHJveSwgb25Nb3VudCwgb25jZSwgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2ssIHByZXZlbnRfZGVmYXVsdCwgcHJvcF9kZXYsIHF1ZXJ5X3NlbGVjdG9yX2FsbCwgcmFmLCBydW4sIHJ1bl9hbGwsIHNhZmVfbm90X2VxdWFsLCBzY2hlZHVsZV91cGRhdGUsIHNlbGVjdF9tdWx0aXBsZV92YWx1ZSwgc2VsZWN0X29wdGlvbiwgc2VsZWN0X29wdGlvbnMsIHNlbGVjdF92YWx1ZSwgc2VsZiwgc2V0Q29udGV4dCwgc2V0X2F0dHJpYnV0ZXMsIHNldF9jdXJyZW50X2NvbXBvbmVudCwgc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEsIHNldF9kYXRhLCBzZXRfZGF0YV9kZXYsIHNldF9pbnB1dF90eXBlLCBzZXRfaW5wdXRfdmFsdWUsIHNldF9ub3csIHNldF9yYWYsIHNldF9zdG9yZV92YWx1ZSwgc2V0X3N0eWxlLCBzZXRfc3ZnX2F0dHJpYnV0ZXMsIHNwYWNlLCBzcHJlYWQsIHN0b3BfcHJvcGFnYXRpb24sIHN1YnNjcmliZSwgc3ZnX2VsZW1lbnQsIHRleHQsIHRpY2ssIHRpbWVfcmFuZ2VzX3RvX2FycmF5LCB0b19udW1iZXIsIHRvZ2dsZV9jbGFzcywgdHJhbnNpdGlvbl9pbiwgdHJhbnNpdGlvbl9vdXQsIHVwZGF0ZV9rZXllZF9lYWNoLCB1cGRhdGVfc2xvdCwgdmFsaWRhdGVfY29tcG9uZW50LCB2YWxpZGF0ZV9lYWNoX2FyZ3VtZW50LCB2YWxpZGF0ZV9lYWNoX2tleXMsIHZhbGlkYXRlX3Nsb3RzLCB2YWxpZGF0ZV9zdG9yZSwgeGxpbmtfYXR0ciB9O1xuIiwiaW1wb3J0IHsgbm9vcCwgc2FmZV9ub3RfZXF1YWwsIHN1YnNjcmliZSwgcnVuX2FsbCwgaXNfZnVuY3Rpb24gfSBmcm9tICcuLi9pbnRlcm5hbCc7XG5leHBvcnQgeyBnZXRfc3RvcmVfdmFsdWUgYXMgZ2V0IH0gZnJvbSAnLi4vaW50ZXJuYWwnO1xuXG5jb25zdCBzdWJzY3JpYmVyX3F1ZXVlID0gW107XG4vKipcbiAqIENyZWF0ZXMgYSBgUmVhZGFibGVgIHN0b3JlIHRoYXQgYWxsb3dzIHJlYWRpbmcgYnkgc3Vic2NyaXB0aW9uLlxuICogQHBhcmFtIHZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXJ9c3RhcnQgc3RhcnQgYW5kIHN0b3Agbm90aWZpY2F0aW9ucyBmb3Igc3Vic2NyaXB0aW9uc1xuICovXG5mdW5jdGlvbiByZWFkYWJsZSh2YWx1ZSwgc3RhcnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmU6IHdyaXRhYmxlKHZhbHVlLCBzdGFydCkuc3Vic2NyaWJlXG4gICAgfTtcbn1cbi8qKlxuICogQ3JlYXRlIGEgYFdyaXRhYmxlYCBzdG9yZSB0aGF0IGFsbG93cyBib3RoIHVwZGF0aW5nIGFuZCByZWFkaW5nIGJ5IHN1YnNjcmlwdGlvbi5cbiAqIEBwYXJhbSB7Kj19dmFsdWUgaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHtTdGFydFN0b3BOb3RpZmllcj19c3RhcnQgc3RhcnQgYW5kIHN0b3Agbm90aWZpY2F0aW9ucyBmb3Igc3Vic2NyaXB0aW9uc1xuICovXG5mdW5jdGlvbiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQgPSBub29wKSB7XG4gICAgbGV0IHN0b3A7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSBbXTtcbiAgICBmdW5jdGlvbiBzZXQobmV3X3ZhbHVlKSB7XG4gICAgICAgIGlmIChzYWZlX25vdF9lcXVhbCh2YWx1ZSwgbmV3X3ZhbHVlKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBuZXdfdmFsdWU7XG4gICAgICAgICAgICBpZiAoc3RvcCkgeyAvLyBzdG9yZSBpcyByZWFkeVxuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bl9xdWV1ZSA9ICFzdWJzY3JpYmVyX3F1ZXVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHMgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgc1sxXSgpO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyX3F1ZXVlLnB1c2gocywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVuX3F1ZXVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZVtpXVswXShzdWJzY3JpYmVyX3F1ZXVlW2kgKyAxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGUoZm4pIHtcbiAgICAgICAgc2V0KGZuKHZhbHVlKSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZShydW4sIGludmFsaWRhdGUgPSBub29wKSB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmliZXIgPSBbcnVuLCBpbnZhbGlkYXRlXTtcbiAgICAgICAgc3Vic2NyaWJlcnMucHVzaChzdWJzY3JpYmVyKTtcbiAgICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgc3RvcCA9IHN0YXJ0KHNldCkgfHwgbm9vcDtcbiAgICAgICAgfVxuICAgICAgICBydW4odmFsdWUpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzdWJzY3JpYmVycy5pbmRleE9mKHN1YnNjcmliZXIpO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIHN0b3AgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4geyBzZXQsIHVwZGF0ZSwgc3Vic2NyaWJlIH07XG59XG5mdW5jdGlvbiBkZXJpdmVkKHN0b3JlcywgZm4sIGluaXRpYWxfdmFsdWUpIHtcbiAgICBjb25zdCBzaW5nbGUgPSAhQXJyYXkuaXNBcnJheShzdG9yZXMpO1xuICAgIGNvbnN0IHN0b3Jlc19hcnJheSA9IHNpbmdsZVxuICAgICAgICA/IFtzdG9yZXNdXG4gICAgICAgIDogc3RvcmVzO1xuICAgIGNvbnN0IGF1dG8gPSBmbi5sZW5ndGggPCAyO1xuICAgIHJldHVybiByZWFkYWJsZShpbml0aWFsX3ZhbHVlLCAoc2V0KSA9PiB7XG4gICAgICAgIGxldCBpbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICAgICAgbGV0IGNsZWFudXAgPSBub29wO1xuICAgICAgICBjb25zdCBzeW5jID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBmbihzaW5nbGUgPyB2YWx1ZXNbMF0gOiB2YWx1ZXMsIHNldCk7XG4gICAgICAgICAgICBpZiAoYXV0bykge1xuICAgICAgICAgICAgICAgIHNldChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xlYW51cCA9IGlzX2Z1bmN0aW9uKHJlc3VsdCkgPyByZXN1bHQgOiBub29wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZXJzID0gc3RvcmVzX2FycmF5Lm1hcCgoc3RvcmUsIGkpID0+IHN1YnNjcmliZShzdG9yZSwgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHBlbmRpbmcgJj0gfigxIDw8IGkpO1xuICAgICAgICAgICAgaWYgKGluaXRlZCkge1xuICAgICAgICAgICAgICAgIHN5bmMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgcGVuZGluZyB8PSAoMSA8PCBpKTtcbiAgICAgICAgfSkpO1xuICAgICAgICBpbml0ZWQgPSB0cnVlO1xuICAgICAgICBzeW5jKCk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgcnVuX2FsbCh1bnN1YnNjcmliZXJzKTtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IHsgZGVyaXZlZCwgcmVhZGFibGUsIHdyaXRhYmxlIH07XG4iLCJpbXBvcnQgeyB3cml0YWJsZSB9IGZyb20gJ3N2ZWx0ZS9zdG9yZSc7XG5cbmV4cG9ydCBjb25zdCBDT05URVhUX0tFWSA9IHt9O1xuXG5leHBvcnQgY29uc3QgcHJlbG9hZCA9ICgpID0+ICh7fSk7IiwiPHNjcmlwdD5cbiAgaW1wb3J0IHsgYWZ0ZXJVcGRhdGUsIG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7XG4gIGV4cG9ydCBsZXQgc2NhbGUgPSBcIk1cIjtcbiAgZXhwb3J0IGxldCBjbGFzc05hbWUgPSBcIlwiO1xuICBleHBvcnQgbGV0IHdpZHRoID0gXCJcIjtcbiAgZXhwb3J0IGxldCBoZWlnaHQgPSBcIlwiO1xuICBleHBvcnQgbGV0IGFyaWFMYWJlbCA9IFwiQWxlcnRNZWRpdW1cIjtcbiAgbGV0IHBhdGg7XG4gIGxldCBzdztcbiAgbGV0IHNoO1xuXG4gIGxldCBmbGFnID0gMTQ7XG4gIG9uTW91bnQoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgfSk7XG5cbiAgYWZ0ZXJVcGRhdGUoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgICBpZiAoIXNjYWxlIHx8IHNjYWxlID09IFwiTVwiKSB7XG4gICAgICBsZXQgcm9vdENsYXNzTmFtZSA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc05hbWU7XG4gICAgICBpZiAocm9vdENsYXNzTmFtZSAmJiByb290Q2xhc3NOYW1lLmluZGV4T2YoXCJzcGVjdHJ1bS0tbGFyZ2VcIikgIT0gLTEpIHtcbiAgICAgICAgc2NhbGUgPSBcIkxcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYWxlID0gXCJNXCI7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbjwvc2NyaXB0PlxuXG5cblxuPHN2Z1xuICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gIHsuLi4kJHJlc3RQcm9wc31cbiAgd2lkdGg9e3dpZHRoIHx8IHN3IHx8IGZsYWd9XG4gIGhlaWdodD17aGVpZ2h0IHx8IHNoIHx8IGZsYWd9XG4gIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICBjbGFzcz1cInNwZWN0cnVtLUljb24ge2NsYXNzTmFtZX1cIj5cbiAgeyNpZiBzY2FsZSA9PT0gJ0wnfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgICBkPVwiTTEwLjU2MyAyLjIwNmwtOS4yNDkgMTYuNTVhLjUuNSAwIDAwLjQzNi43NDRoMTguNWEuNS41IDAgMDAuNDM2LS43NDRsLTkuMjUxLTE2LjU1YS41LjUgMCAwMC0uODcyIDB6bTEuNDM2XG4gICAgICAxNS4wNDRhLjI1LjI1IDAgMDEtLjI1LjI1aC0xLjVhLjI1LjI1IDAgMDEtLjI1LS4yNXYtMS41YS4yNS4yNSAwIDAxLjI1LS4yNWgxLjVhLjI1LjI1IDAgMDEuMjUuMjV6bTAtMy41YS4yNS4yNSAwXG4gICAgICAwMS0uMjUuMjVoLTEuNWEuMjUuMjUgMCAwMS0uMjUtLjI1di02YS4yNS4yNSAwIDAxLjI1LS4yNWgxLjVhLjI1LjI1IDAgMDEuMjUuMjV6XCIgLz5cbiAgezplbHNlIGlmIHNjYWxlID09PSAnTSd9XG4gICAgPHBhdGhcbiAgICAgIGJpbmQ6dGhpcz17cGF0aH1cbiAgICAgIGQ9XCJNOC41NjQgMS4yODlMLjIgMTYuMjU2QS41LjUgMCAwMC42MzYgMTdoMTYuNzI4YS41LjUgMCAwMC40MzYtLjc0NEw5LjQzNiAxLjI4OWEuNS41IDAgMDAtLjg3MiAwek0xMCAxNC43NWEuMjUuMjVcbiAgICAgIDAgMDEtLjI1LjI1aC0xLjVhLjI1LjI1IDAgMDEtLjI1LS4yNXYtMS41YS4yNS4yNSAwIDAxLjI1LS4yNWgxLjVhLjI1LjI1IDAgMDEuMjUuMjV6bTAtM2EuMjUuMjUgMFxuICAgICAgMDEtLjI1LjI1aC0xLjVhLjI1LjI1IDAgMDEtLjI1LS4yNXYtNmEuMjUuMjUgMCAwMS4yNS0uMjVoMS41YS4yNS4yNSAwIDAxLjI1LjI1elwiIC8+XG4gIHsvaWZ9XG48L3N2Zz5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBleHBvcnQgbGV0IHNjYWxlID0gXCJNXCI7XG4gIGV4cG9ydCBsZXQgY2xhc3NOYW1lID0gXCJcIjtcbiAgZXhwb3J0IGxldCB3aWR0aCA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgaGVpZ2h0ID0gXCJcIjtcbiAgZXhwb3J0IGxldCBhcmlhTGFiZWwgPSBcIkNoZWNrbWFya01lZGl1bVwiO1xuICBsZXQgcGF0aDtcbiAgbGV0IHN3O1xuICBsZXQgc2g7XG5cbiAgbGV0IGZsYWcgPSAxNDtcbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICB9KTtcblxuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICAgIGlmICghc2NhbGUgfHwgc2NhbGUgPT0gXCJNXCIpIHtcbiAgICAgIGxldCByb290Q2xhc3NOYW1lID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZTtcbiAgICAgIGlmIChyb290Q2xhc3NOYW1lICYmIHJvb3RDbGFzc05hbWUuaW5kZXhPZihcInNwZWN0cnVtLS1sYXJnZVwiKSAhPSAtMSkge1xuICAgICAgICBzY2FsZSA9IFwiTFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NhbGUgPSBcIk1cIjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuPC9zY3JpcHQ+XG5cblxuXG48c3ZnXG4gIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgey4uLiQkcmVzdFByb3BzfVxuICB3aWR0aD17d2lkdGggfHwgc3cgfHwgZmxhZ31cbiAgaGVpZ2h0PXtoZWlnaHQgfHwgc2ggfHwgZmxhZ31cbiAgZmlsbD1cImN1cnJlbnRDb2xvclwiXG4gIGNsYXNzPVwic3BlY3RydW0tSWNvbiB7Y2xhc3NOYW1lfVwiPlxuICB7I2lmIHNjYWxlID09PSAnTCd9XG4gICAgPHBhdGhcbiAgICAgIGJpbmQ6dGhpcz17cGF0aH1cbiAgICAgIGQ9XCJNNiAxNGExIDEgMCAwMS0uNzg5LS4zODVsLTQtNWExIDEgMCAxMTEuNTc3LTEuMjNMNiAxMS4zNzZsNy4yMTMtOC45OWExIDEgMCAxMTEuNTc2IDEuMjNsLTggMTBhMSAxIDBcbiAgICAgIDAxLS43ODkuMzg0elwiIC8+XG4gIHs6ZWxzZSBpZiBzY2FsZSA9PT0gJ00nfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgICBkPVwiTTQuNSAxMGExLjAyMiAxLjAyMiAwIDAxLS43OTktLjM4NGwtMi40ODgtM2ExIDEgMCAwMTEuNTc2LTEuMjMzTDQuNSA3LjM3Nmw0LjcxMi01Ljk5MWExIDEgMCAxMTEuNTc2IDEuMjNsLTUuNTFcbiAgICAgIDdBLjk3OC45NzggMCAwMTQuNSAxMHpcIiAvPlxuICB7L2lmfVxuPC9zdmc+XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBhZnRlclVwZGF0ZSwgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgZXhwb3J0IGxldCBzY2FsZSA9IFwiTVwiO1xuICBleHBvcnQgbGV0IGNsYXNzTmFtZSA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgd2lkdGggPSBcIlwiO1xuICBleHBvcnQgbGV0IGhlaWdodCA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgYXJpYUxhYmVsID0gXCJDaGV2cm9uRG93bk1lZGl1bVwiO1xuICBsZXQgcGF0aDtcbiAgbGV0IHN3O1xuICBsZXQgc2g7XG5cbiAgbGV0IGZsYWcgPSAxNDtcbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICB9KTtcblxuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHN3ID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIHNoID0gcGF0aC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfVxuICAgIGlmICghc2NhbGUgfHwgc2NhbGUgPT0gXCJNXCIpIHtcbiAgICAgIGxldCByb290Q2xhc3NOYW1lID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZTtcbiAgICAgIGlmIChyb290Q2xhc3NOYW1lICYmIHJvb3RDbGFzc05hbWUuaW5kZXhPZihcInNwZWN0cnVtLS1sYXJnZVwiKSAhPSAtMSkge1xuICAgICAgICBzY2FsZSA9IFwiTFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NhbGUgPSBcIk1cIjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuPC9zY3JpcHQ+XG5cblxuXG48c3ZnXG4gIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgey4uLiQkcmVzdFByb3BzfVxuICB3aWR0aD17d2lkdGggfHwgc3cgfHwgZmxhZ31cbiAgaGVpZ2h0PXtoZWlnaHQgfHwgc2ggfHwgZmxhZ31cbiAgZmlsbD1cImN1cnJlbnRDb2xvclwiXG4gIGNsYXNzPVwic3BlY3RydW0tSWNvbiB7Y2xhc3NOYW1lfVwiPlxuICB7I2lmIHNjYWxlID09PSAnTCd9XG4gICAgPHBhdGhcbiAgICAgIGJpbmQ6dGhpcz17cGF0aH1cbiAgICBkPVwiTTExLjk5IDEuNTFhMSAxIDAgMDAtMS43MDctLjcwN0w2IDUuMDg2IDEuNzE3LjgwM0ExIDEgMCAxMC4zMDMgMi4yMTdsNC45OSA0Ljk5YTEgMSAwIDAwMS40MTQgMGw0Ljk5LTQuOTlhLjk5Ny45OTdcbiAgICAwIDAwLjI5My0uNzA3elwiXG4vPlxuICB7OmVsc2UgaWYgc2NhbGUgPT09ICdNJ31cbiAgICA8cGF0aFxuICAgICAgYmluZDp0aGlzPXtwYXRofVxuICAgIGQ9XCJNOS45OSAxLjAxQTEgMSAwIDAwOC4yODMuMzAzTDUgMy41ODYgMS43MTcuMzAzQTEgMSAwIDEwLjMwMyAxLjcxN2wzLjk5IDMuOThhMSAxIDAgMDAxLjQxNCAwbDMuOTktMy45OGEuOTk3Ljk5NyAwXG4gICAgMDAuMjkzLS43MDd6XCIvPlxuICB7L2lmfVxuPC9zdmc+XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBhZnRlclVwZGF0ZSwgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbiAgZXhwb3J0IGxldCBzY2FsZSA9IFwiTVwiO1xuICBleHBvcnQgbGV0IGNsYXNzTmFtZSA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgd2lkdGggPSBcIlwiO1xuICBleHBvcnQgbGV0IGhlaWdodCA9IFwiXCI7XG4gIGV4cG9ydCBsZXQgYXJpYUxhYmVsID0gXCJDaGV2cm9uUmlnaHRNZWRpdW1cIjtcbiAgbGV0IHBhdGg7XG4gIGxldCBzdztcbiAgbGV0IHNoO1xuXG4gIGxldCBmbGFnID0gMTQ7XG4gIG9uTW91bnQoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgfSk7XG5cbiAgYWZ0ZXJVcGRhdGUoKCkgPT4ge1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBzdyA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBzaCA9IHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIH1cbiAgICBpZiAoIXNjYWxlIHx8IHNjYWxlID09IFwiTVwiKSB7XG4gICAgICBsZXQgcm9vdENsYXNzTmFtZSA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc05hbWU7XG4gICAgICBpZiAocm9vdENsYXNzTmFtZSAmJiByb290Q2xhc3NOYW1lLmluZGV4T2YoXCJzcGVjdHJ1bS0tbGFyZ2VcIikgIT0gLTEpIHtcbiAgICAgICAgc2NhbGUgPSBcIkxcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYWxlID0gXCJNXCI7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbjwvc2NyaXB0PlxuXG5cblxuPHN2Z1xuICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gIHsuLi4kJHJlc3RQcm9wc31cbiAgd2lkdGg9e3dpZHRoIHx8IHN3IHx8IGZsYWd9XG4gIGhlaWdodD17aGVpZ2h0IHx8IHNoIHx8IGZsYWd9XG4gIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICBjbGFzcz1cInNwZWN0cnVtLUljb24ge2NsYXNzTmFtZX1cIj5cbiAgeyNpZiBzY2FsZSA9PT0gJ0wnfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgZD1cIk03LjUgNmEuOTk3Ljk5NyAwIDAwLS4yOTMtLjcwN0wyLjIxNy4zMDNBMSAxIDAgMTAuODAzIDEuNzE3TDUuMDg2IDYgLjgwMyAxMC4yODNhMSAxIDAgMTAxLjQxNFxuICAgIDEuNDE0bDQuOTktNC45OUEuOTk3Ljk5NyAwIDAwNy41IDZ6XCJcbi8+XG4gIHs6ZWxzZSBpZiBzY2FsZSA9PT0gJ00nfVxuICAgIDxwYXRoXG4gICAgICBiaW5kOnRoaXM9e3BhdGh9XG4gICAgZD1cIk01Ljk5IDVhLjk5Ny45OTcgMCAwMC0uMjkzLS43MDdMMS43MTcuMzAzQTEgMSAwIDEwLjMwMyAxLjcxN0wzLjU4NiA1IC4zMDMgOC4yODNhMSAxIDAgMTAxLjQxNFxuICAgIDEuNDE0bDMuOTgtMy45OUEuOTk3Ljk5NyAwIDAwNS45OSA1elwiLz5cbiAgey9pZn1cbjwvc3ZnPlxuIiwiLyoqXHJcbiAqIEEgY29sbGVjdGlvbiBvZiBzaGltcyB0aGF0IHByb3ZpZGUgbWluaW1hbCBmdW5jdGlvbmFsaXR5IG9mIHRoZSBFUzYgY29sbGVjdGlvbnMuXHJcbiAqXHJcbiAqIFRoZXNlIGltcGxlbWVudGF0aW9ucyBhcmUgbm90IG1lYW50IHRvIGJlIHVzZWQgb3V0c2lkZSBvZiB0aGUgUmVzaXplT2JzZXJ2ZXJcclxuICogbW9kdWxlcyBhcyB0aGV5IGNvdmVyIG9ubHkgYSBsaW1pdGVkIHJhbmdlIG9mIHVzZSBjYXNlcy5cclxuICovXHJcbi8qIGVzbGludC1kaXNhYmxlIHJlcXVpcmUtanNkb2MsIHZhbGlkLWpzZG9jICovXHJcbnZhciBNYXBTaGltID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0eXBlb2YgTWFwICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiBNYXA7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaW5kZXggaW4gcHJvdmlkZWQgYXJyYXkgdGhhdCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7QXJyYXk8QXJyYXk+fSBhcnJcclxuICAgICAqIEBwYXJhbSB7Kn0ga2V5XHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRJbmRleChhcnIsIGtleSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAtMTtcclxuICAgICAgICBhcnIuc29tZShmdW5jdGlvbiAoZW50cnksIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeVswXSA9PT0ga2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBjbGFzc18xKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9fZW50cmllc19fID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGFzc18xLnByb3RvdHlwZSwgXCJzaXplXCIsIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fX2VudHJpZXNfXy5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0ga2V5XHJcbiAgICAgICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBnZXRJbmRleCh0aGlzLl9fZW50cmllc19fLCBrZXkpO1xyXG4gICAgICAgICAgICB2YXIgZW50cnkgPSB0aGlzLl9fZW50cmllc19fW2luZGV4XTtcclxuICAgICAgICAgICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5WzFdO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBrZXlcclxuICAgICAgICAgKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXgodGhpcy5fX2VudHJpZXNfXywga2V5KTtcclxuICAgICAgICAgICAgaWYgKH5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fX2VudHJpZXNfX1tpbmRleF1bMV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX19lbnRyaWVzX18ucHVzaChba2V5LCB2YWx1ZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAcGFyYW0geyp9IGtleVxyXG4gICAgICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsYXNzXzEucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGVudHJpZXMgPSB0aGlzLl9fZW50cmllc19fO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBnZXRJbmRleChlbnRyaWVzLCBrZXkpO1xyXG4gICAgICAgICAgICBpZiAofmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBlbnRyaWVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0ga2V5XHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF+Z2V0SW5kZXgodGhpcy5fX2VudHJpZXNfXywga2V5KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsYXNzXzEucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9fZW50cmllc19fLnNwbGljZSgwKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBbY3R4PW51bGxdXHJcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xhc3NfMS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgY3R4KSB7XHJcbiAgICAgICAgICAgIGlmIChjdHggPT09IHZvaWQgMCkgeyBjdHggPSBudWxsOyB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLl9fZW50cmllc19fOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVudHJ5ID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjdHgsIGVudHJ5WzFdLCBlbnRyeVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBjbGFzc18xO1xyXG4gICAgfSgpKTtcclxufSkoKTtcblxuLyoqXHJcbiAqIERldGVjdHMgd2hldGhlciB3aW5kb3cgYW5kIGRvY3VtZW50IG9iamVjdHMgYXJlIGF2YWlsYWJsZSBpbiBjdXJyZW50IGVudmlyb25tZW50LlxyXG4gKi9cclxudmFyIGlzQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50ID09PSBkb2N1bWVudDtcblxuLy8gUmV0dXJucyBnbG9iYWwgb2JqZWN0IG9mIGEgY3VycmVudCBlbnZpcm9ubWVudC5cclxudmFyIGdsb2JhbCQxID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiBnbG9iYWwuTWF0aCA9PT0gTWF0aCkge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWw7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PT0gTWF0aCkge1xyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09PSBNYXRoKSB7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdztcclxuICAgIH1cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xyXG4gICAgcmV0dXJuIEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XHJcbn0pKCk7XG5cbi8qKlxyXG4gKiBBIHNoaW0gZm9yIHRoZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgd2hpY2ggZmFsbHMgYmFjayB0byB0aGUgc2V0VGltZW91dCBpZlxyXG4gKiBmaXJzdCBvbmUgaXMgbm90IHN1cHBvcnRlZC5cclxuICpcclxuICogQHJldHVybnMge251bWJlcn0gUmVxdWVzdHMnIGlkZW50aWZpZXIuXHJcbiAqL1xyXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lJDEgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvLyBJdCdzIHJlcXVpcmVkIHRvIHVzZSBhIGJvdW5kZWQgZnVuY3Rpb24gYmVjYXVzZSBJRSBzb21ldGltZXMgdGhyb3dzXHJcbiAgICAgICAgLy8gYW4gXCJJbnZhbGlkIGNhbGxpbmcgb2JqZWN0XCIgZXJyb3IgaWYgckFGIGlzIGludm9rZWQgd2l0aG91dCB0aGUgZ2xvYmFsXHJcbiAgICAgICAgLy8gb2JqZWN0IG9uIHRoZSBsZWZ0IGhhbmQgc2lkZS5cclxuICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQoZ2xvYmFsJDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykgeyByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBjYWxsYmFjayhEYXRlLm5vdygpKTsgfSwgMTAwMCAvIDYwKTsgfTtcclxufSkoKTtcblxuLy8gRGVmaW5lcyBtaW5pbXVtIHRpbWVvdXQgYmVmb3JlIGFkZGluZyBhIHRyYWlsaW5nIGNhbGwuXHJcbnZhciB0cmFpbGluZ1RpbWVvdXQgPSAyO1xyXG4vKipcclxuICogQ3JlYXRlcyBhIHdyYXBwZXIgZnVuY3Rpb24gd2hpY2ggZW5zdXJlcyB0aGF0IHByb3ZpZGVkIGNhbGxiYWNrIHdpbGwgYmVcclxuICogaW52b2tlZCBvbmx5IG9uY2UgZHVyaW5nIHRoZSBzcGVjaWZpZWQgZGVsYXkgcGVyaW9kLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGJlIGludm9rZWQgYWZ0ZXIgdGhlIGRlbGF5IHBlcmlvZC5cclxuICogQHBhcmFtIHtudW1iZXJ9IGRlbGF5IC0gRGVsYXkgYWZ0ZXIgd2hpY2ggdG8gaW52b2tlIGNhbGxiYWNrLlxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAqL1xyXG5mdW5jdGlvbiB0aHJvdHRsZSAoY2FsbGJhY2ssIGRlbGF5KSB7XHJcbiAgICB2YXIgbGVhZGluZ0NhbGwgPSBmYWxzZSwgdHJhaWxpbmdDYWxsID0gZmFsc2UsIGxhc3RDYWxsVGltZSA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIEludm9rZXMgdGhlIG9yaWdpbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIGFuZCBzY2hlZHVsZXMgbmV3IGludm9jYXRpb24gaWZcclxuICAgICAqIHRoZSBcInByb3h5XCIgd2FzIGNhbGxlZCBkdXJpbmcgY3VycmVudCByZXF1ZXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZXNvbHZlUGVuZGluZygpIHtcclxuICAgICAgICBpZiAobGVhZGluZ0NhbGwpIHtcclxuICAgICAgICAgICAgbGVhZGluZ0NhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRyYWlsaW5nQ2FsbCkge1xyXG4gICAgICAgICAgICBwcm94eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGJhY2sgaW52b2tlZCBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5LiBJdCB3aWxsIGZ1cnRoZXIgcG9zdHBvbmVcclxuICAgICAqIGludm9jYXRpb24gb2YgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIGRlbGVnYXRpbmcgaXQgdG8gdGhlXHJcbiAgICAgKiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRpbWVvdXRDYWxsYmFjaygpIHtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUkMShyZXNvbHZlUGVuZGluZyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNjaGVkdWxlcyBpbnZvY2F0aW9uIG9mIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcHJveHkoKSB7XHJcbiAgICAgICAgdmFyIHRpbWVTdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKGxlYWRpbmdDYWxsKSB7XHJcbiAgICAgICAgICAgIC8vIFJlamVjdCBpbW1lZGlhdGVseSBmb2xsb3dpbmcgY2FsbHMuXHJcbiAgICAgICAgICAgIGlmICh0aW1lU3RhbXAgLSBsYXN0Q2FsbFRpbWUgPCB0cmFpbGluZ1RpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTY2hlZHVsZSBuZXcgY2FsbCB0byBiZSBpbiBpbnZva2VkIHdoZW4gdGhlIHBlbmRpbmcgb25lIGlzIHJlc29sdmVkLlxyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGltcG9ydGFudCBmb3IgXCJ0cmFuc2l0aW9uc1wiIHdoaWNoIG5ldmVyIGFjdHVhbGx5IHN0YXJ0XHJcbiAgICAgICAgICAgIC8vIGltbWVkaWF0ZWx5IHNvIHRoZXJlIGlzIGEgY2hhbmNlIHRoYXQgd2UgbWlnaHQgbWlzcyBvbmUgaWYgY2hhbmdlXHJcbiAgICAgICAgICAgIC8vIGhhcHBlbnMgYW1pZHMgdGhlIHBlbmRpbmcgaW52b2NhdGlvbi5cclxuICAgICAgICAgICAgdHJhaWxpbmdDYWxsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxlYWRpbmdDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgdHJhaWxpbmdDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQodGltZW91dENhbGxiYWNrLCBkZWxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhc3RDYWxsVGltZSA9IHRpbWVTdGFtcDtcclxuICAgIH1cclxuICAgIHJldHVybiBwcm94eTtcclxufVxuXG4vLyBNaW5pbXVtIGRlbGF5IGJlZm9yZSBpbnZva2luZyB0aGUgdXBkYXRlIG9mIG9ic2VydmVycy5cclxudmFyIFJFRlJFU0hfREVMQVkgPSAyMDtcclxuLy8gQSBsaXN0IG9mIHN1YnN0cmluZ3Mgb2YgQ1NTIHByb3BlcnRpZXMgdXNlZCB0byBmaW5kIHRyYW5zaXRpb24gZXZlbnRzIHRoYXRcclxuLy8gbWlnaHQgYWZmZWN0IGRpbWVuc2lvbnMgb2Ygb2JzZXJ2ZWQgZWxlbWVudHMuXHJcbnZhciB0cmFuc2l0aW9uS2V5cyA9IFsndG9wJywgJ3JpZ2h0JywgJ2JvdHRvbScsICdsZWZ0JywgJ3dpZHRoJywgJ2hlaWdodCcsICdzaXplJywgJ3dlaWdodCddO1xyXG4vLyBDaGVjayBpZiBNdXRhdGlvbk9ic2VydmVyIGlzIGF2YWlsYWJsZS5cclxudmFyIG11dGF0aW9uT2JzZXJ2ZXJTdXBwb3J0ZWQgPSB0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCc7XHJcbi8qKlxyXG4gKiBTaW5nbGV0b24gY29udHJvbGxlciBjbGFzcyB3aGljaCBoYW5kbGVzIHVwZGF0ZXMgb2YgUmVzaXplT2JzZXJ2ZXIgaW5zdGFuY2VzLlxyXG4gKi9cclxudmFyIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIERPTSBsaXN0ZW5lcnMgaGF2ZSBiZWVuIGFkZGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHByaXZhdGUge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWRfID0gZmFsc2U7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGVsbHMgdGhhdCBjb250cm9sbGVyIGhhcyBzdWJzY3JpYmVkIGZvciBNdXRhdGlvbiBFdmVudHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm11dGF0aW9uRXZlbnRzQWRkZWRfID0gZmFsc2U7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgcmVmZXJlbmNlIHRvIHRoZSBpbnN0YW5jZSBvZiBNdXRhdGlvbk9ic2VydmVyLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHByaXZhdGUge011dGF0aW9uT2JzZXJ2ZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5tdXRhdGlvbnNPYnNlcnZlcl8gPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEEgbGlzdCBvZiBjb25uZWN0ZWQgb2JzZXJ2ZXJzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHByaXZhdGUge0FycmF5PFJlc2l6ZU9ic2VydmVyU1BJPn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9ic2VydmVyc18gPSBbXTtcclxuICAgICAgICB0aGlzLm9uVHJhbnNpdGlvbkVuZF8gPSB0aGlzLm9uVHJhbnNpdGlvbkVuZF8uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2ggPSB0aHJvdHRsZSh0aGlzLnJlZnJlc2guYmluZCh0aGlzKSwgUkVGUkVTSF9ERUxBWSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgb2JzZXJ2ZXIgdG8gb2JzZXJ2ZXJzIGxpc3QuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtSZXNpemVPYnNlcnZlclNQSX0gb2JzZXJ2ZXIgLSBPYnNlcnZlciB0byBiZSBhZGRlZC5cclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIucHJvdG90eXBlLmFkZE9ic2VydmVyID0gZnVuY3Rpb24gKG9ic2VydmVyKSB7XHJcbiAgICAgICAgaWYgKCF+dGhpcy5vYnNlcnZlcnNfLmluZGV4T2Yob2JzZXJ2ZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzXy5wdXNoKG9ic2VydmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQWRkIGxpc3RlbmVycyBpZiB0aGV5IGhhdmVuJ3QgYmVlbiBhZGRlZCB5ZXQuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbm5lY3RlZF8pIHtcclxuICAgICAgICAgICAgdGhpcy5jb25uZWN0XygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgb2JzZXJ2ZXIgZnJvbSBvYnNlcnZlcnMgbGlzdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1Jlc2l6ZU9ic2VydmVyU1BJfSBvYnNlcnZlciAtIE9ic2VydmVyIHRvIGJlIHJlbW92ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLnByb3RvdHlwZS5yZW1vdmVPYnNlcnZlciA9IGZ1bmN0aW9uIChvYnNlcnZlcikge1xyXG4gICAgICAgIHZhciBvYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVyc187XHJcbiAgICAgICAgdmFyIGluZGV4ID0gb2JzZXJ2ZXJzLmluZGV4T2Yob2JzZXJ2ZXIpO1xyXG4gICAgICAgIC8vIFJlbW92ZSBvYnNlcnZlciBpZiBpdCdzIHByZXNlbnQgaW4gcmVnaXN0cnkuXHJcbiAgICAgICAgaWYgKH5pbmRleCkge1xyXG4gICAgICAgICAgICBvYnNlcnZlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBpZiBjb250cm9sbGVyIGhhcyBubyBjb25uZWN0ZWQgb2JzZXJ2ZXJzLlxyXG4gICAgICAgIGlmICghb2JzZXJ2ZXJzLmxlbmd0aCAmJiB0aGlzLmNvbm5lY3RlZF8pIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNjb25uZWN0XygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEludm9rZXMgdGhlIHVwZGF0ZSBvZiBvYnNlcnZlcnMuIEl0IHdpbGwgY29udGludWUgcnVubmluZyB1cGRhdGVzIGluc29mYXJcclxuICAgICAqIGl0IGRldGVjdHMgY2hhbmdlcy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjaGFuZ2VzRGV0ZWN0ZWQgPSB0aGlzLnVwZGF0ZU9ic2VydmVyc18oKTtcclxuICAgICAgICAvLyBDb250aW51ZSBydW5uaW5nIHVwZGF0ZXMgaWYgY2hhbmdlcyBoYXZlIGJlZW4gZGV0ZWN0ZWQgYXMgdGhlcmUgbWlnaHRcclxuICAgICAgICAvLyBiZSBmdXR1cmUgb25lcyBjYXVzZWQgYnkgQ1NTIHRyYW5zaXRpb25zLlxyXG4gICAgICAgIGlmIChjaGFuZ2VzRGV0ZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyBldmVyeSBvYnNlcnZlciBmcm9tIG9ic2VydmVycyBsaXN0IGFuZCBub3RpZmllcyB0aGVtIG9mIHF1ZXVlZFxyXG4gICAgICogZW50cmllcy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgXCJ0cnVlXCIgaWYgYW55IG9ic2VydmVyIGhhcyBkZXRlY3RlZCBjaGFuZ2VzIGluXHJcbiAgICAgKiAgICAgIGRpbWVuc2lvbnMgb2YgaXQncyBlbGVtZW50cy5cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVPYnNlcnZlcnNfID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIENvbGxlY3Qgb2JzZXJ2ZXJzIHRoYXQgaGF2ZSBhY3RpdmUgb2JzZXJ2YXRpb25zLlxyXG4gICAgICAgIHZhciBhY3RpdmVPYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVyc18uZmlsdGVyKGZ1bmN0aW9uIChvYnNlcnZlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXIuZ2F0aGVyQWN0aXZlKCksIG9ic2VydmVyLmhhc0FjdGl2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIERlbGl2ZXIgbm90aWZpY2F0aW9ucyBpbiBhIHNlcGFyYXRlIGN5Y2xlIGluIG9yZGVyIHRvIGF2b2lkIGFueVxyXG4gICAgICAgIC8vIGNvbGxpc2lvbnMgYmV0d2VlbiBvYnNlcnZlcnMsIGUuZy4gd2hlbiBtdWx0aXBsZSBpbnN0YW5jZXMgb2ZcclxuICAgICAgICAvLyBSZXNpemVPYnNlcnZlciBhcmUgdHJhY2tpbmcgdGhlIHNhbWUgZWxlbWVudCBhbmQgdGhlIGNhbGxiYWNrIG9mIG9uZVxyXG4gICAgICAgIC8vIG9mIHRoZW0gY2hhbmdlcyBjb250ZW50IGRpbWVuc2lvbnMgb2YgdGhlIG9ic2VydmVkIHRhcmdldC4gU29tZXRpbWVzXHJcbiAgICAgICAgLy8gdGhpcyBtYXkgcmVzdWx0IGluIG5vdGlmaWNhdGlvbnMgYmVpbmcgYmxvY2tlZCBmb3IgdGhlIHJlc3Qgb2Ygb2JzZXJ2ZXJzLlxyXG4gICAgICAgIGFjdGl2ZU9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZlcikgeyByZXR1cm4gb2JzZXJ2ZXIuYnJvYWRjYXN0QWN0aXZlKCk7IH0pO1xyXG4gICAgICAgIHJldHVybiBhY3RpdmVPYnNlcnZlcnMubGVuZ3RoID4gMDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemVzIERPTSBsaXN0ZW5lcnMuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIucHJvdG90eXBlLmNvbm5lY3RfID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIERvIG5vdGhpbmcgaWYgcnVubmluZyBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50IG9yIGlmIGxpc3RlbmVyc1xyXG4gICAgICAgIC8vIGhhdmUgYmVlbiBhbHJlYWR5IGFkZGVkLlxyXG4gICAgICAgIGlmICghaXNCcm93c2VyIHx8IHRoaXMuY29ubmVjdGVkXykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFN1YnNjcmlwdGlvbiB0byB0aGUgXCJUcmFuc2l0aW9uZW5kXCIgZXZlbnQgaXMgdXNlZCBhcyBhIHdvcmthcm91bmQgZm9yXHJcbiAgICAgICAgLy8gZGVsYXllZCB0cmFuc2l0aW9ucy4gVGhpcyB3YXkgaXQncyBwb3NzaWJsZSB0byBjYXB0dXJlIGF0IGxlYXN0IHRoZVxyXG4gICAgICAgIC8vIGZpbmFsIHN0YXRlIG9mIGFuIGVsZW1lbnQuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHRoaXMub25UcmFuc2l0aW9uRW5kXyk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVmcmVzaCk7XHJcbiAgICAgICAgaWYgKG11dGF0aW9uT2JzZXJ2ZXJTdXBwb3J0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5tdXRhdGlvbnNPYnNlcnZlcl8gPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLnJlZnJlc2gpO1xyXG4gICAgICAgICAgICB0aGlzLm11dGF0aW9uc09ic2VydmVyXy5vYnNlcnZlKGRvY3VtZW50LCB7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01TdWJ0cmVlTW9kaWZpZWQnLCB0aGlzLnJlZnJlc2gpO1xyXG4gICAgICAgICAgICB0aGlzLm11dGF0aW9uRXZlbnRzQWRkZWRfID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWRfID0gdHJ1ZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgRE9NIGxpc3RlbmVycy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5wcm90b3R5cGUuZGlzY29ubmVjdF8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiBydW5uaW5nIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQgb3IgaWYgbGlzdGVuZXJzXHJcbiAgICAgICAgLy8gaGF2ZSBiZWVuIGFscmVhZHkgcmVtb3ZlZC5cclxuICAgICAgICBpZiAoIWlzQnJvd3NlciB8fCAhdGhpcy5jb25uZWN0ZWRfKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHRoaXMub25UcmFuc2l0aW9uRW5kXyk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVmcmVzaCk7XHJcbiAgICAgICAgaWYgKHRoaXMubXV0YXRpb25zT2JzZXJ2ZXJfKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRpb25zT2JzZXJ2ZXJfLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubXV0YXRpb25FdmVudHNBZGRlZF8pIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NU3VidHJlZU1vZGlmaWVkJywgdGhpcy5yZWZyZXNoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tdXRhdGlvbnNPYnNlcnZlcl8gPSBudWxsO1xyXG4gICAgICAgIHRoaXMubXV0YXRpb25FdmVudHNBZGRlZF8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3RlZF8gPSBmYWxzZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFwiVHJhbnNpdGlvbmVuZFwiIGV2ZW50IGhhbmRsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7VHJhbnNpdGlvbkV2ZW50fSBldmVudFxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5wcm90b3R5cGUub25UcmFuc2l0aW9uRW5kXyA9IGZ1bmN0aW9uIChfYSkge1xyXG4gICAgICAgIHZhciBfYiA9IF9hLnByb3BlcnR5TmFtZSwgcHJvcGVydHlOYW1lID0gX2IgPT09IHZvaWQgMCA/ICcnIDogX2I7XHJcbiAgICAgICAgLy8gRGV0ZWN0IHdoZXRoZXIgdHJhbnNpdGlvbiBtYXkgYWZmZWN0IGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudC5cclxuICAgICAgICB2YXIgaXNSZWZsb3dQcm9wZXJ0eSA9IHRyYW5zaXRpb25LZXlzLnNvbWUoZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF+cHJvcGVydHlOYW1lLmluZGV4T2Yoa2V5KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoaXNSZWZsb3dQcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGluc3RhbmNlIG9mIHRoZSBSZXNpemVPYnNlcnZlckNvbnRyb2xsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Jlc2l6ZU9ic2VydmVyQ29udHJvbGxlcn1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyLmdldEluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pbnN0YW5jZV8pIHtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV8gPSBuZXcgUmVzaXplT2JzZXJ2ZXJDb250cm9sbGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlXztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEhvbGRzIHJlZmVyZW5jZSB0byB0aGUgY29udHJvbGxlcidzIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlIHtSZXNpemVPYnNlcnZlckNvbnRyb2xsZXJ9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5pbnN0YW5jZV8gPSBudWxsO1xyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlcjtcclxufSgpKTtcblxuLyoqXHJcbiAqIERlZmluZXMgbm9uLXdyaXRhYmxlL2VudW1lcmFibGUgcHJvcGVydGllcyBvZiB0aGUgcHJvdmlkZWQgdGFyZ2V0IG9iamVjdC5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCAtIE9iamVjdCBmb3Igd2hpY2ggdG8gZGVmaW5lIHByb3BlcnRpZXMuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyAtIFByb3BlcnRpZXMgdG8gYmUgZGVmaW5lZC5cclxuICogQHJldHVybnMge09iamVjdH0gVGFyZ2V0IG9iamVjdC5cclxuICovXHJcbnZhciBkZWZpbmVDb25maWd1cmFibGUgPSAoZnVuY3Rpb24gKHRhcmdldCwgcHJvcHMpIHtcclxuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3Qua2V5cyhwcm9wcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHtcclxuICAgICAgICAgICAgdmFsdWU6IHByb3BzW2tleV0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhcmdldDtcclxufSk7XG5cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBnbG9iYWwgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCBwcm92aWRlZCBlbGVtZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0XHJcbiAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgZ2V0V2luZG93T2YgPSAoZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgLy8gQXNzdW1lIHRoYXQgdGhlIGVsZW1lbnQgaXMgYW4gaW5zdGFuY2Ugb2YgTm9kZSwgd2hpY2ggbWVhbnMgdGhhdCBpdFxyXG4gICAgLy8gaGFzIHRoZSBcIm93bmVyRG9jdW1lbnRcIiBwcm9wZXJ0eSBmcm9tIHdoaWNoIHdlIGNhbiByZXRyaWV2ZSBhXHJcbiAgICAvLyBjb3JyZXNwb25kaW5nIGdsb2JhbCBvYmplY3QuXHJcbiAgICB2YXIgb3duZXJHbG9iYWwgPSB0YXJnZXQgJiYgdGFyZ2V0Lm93bmVyRG9jdW1lbnQgJiYgdGFyZ2V0Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XHJcbiAgICAvLyBSZXR1cm4gdGhlIGxvY2FsIGdsb2JhbCBvYmplY3QgaWYgaXQncyBub3QgcG9zc2libGUgZXh0cmFjdCBvbmUgZnJvbVxyXG4gICAgLy8gcHJvdmlkZWQgZWxlbWVudC5cclxuICAgIHJldHVybiBvd25lckdsb2JhbCB8fCBnbG9iYWwkMTtcclxufSk7XG5cbi8vIFBsYWNlaG9sZGVyIG9mIGFuIGVtcHR5IGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG52YXIgZW1wdHlSZWN0ID0gY3JlYXRlUmVjdEluaXQoMCwgMCwgMCwgMCk7XHJcbi8qKlxyXG4gKiBDb252ZXJ0cyBwcm92aWRlZCBzdHJpbmcgdG8gYSBudW1iZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gdmFsdWVcclxuICogQHJldHVybnMge251bWJlcn1cclxuICovXHJcbmZ1bmN0aW9uIHRvRmxvYXQodmFsdWUpIHtcclxuICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKSB8fCAwO1xyXG59XHJcbi8qKlxyXG4gKiBFeHRyYWN0cyBib3JkZXJzIHNpemUgZnJvbSBwcm92aWRlZCBzdHlsZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Q1NTU3R5bGVEZWNsYXJhdGlvbn0gc3R5bGVzXHJcbiAqIEBwYXJhbSB7Li4uc3RyaW5nfSBwb3NpdGlvbnMgLSBCb3JkZXJzIHBvc2l0aW9ucyAodG9wLCByaWdodCwgLi4uKVxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Qm9yZGVyc1NpemUoc3R5bGVzKSB7XHJcbiAgICB2YXIgcG9zaXRpb25zID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHBvc2l0aW9uc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIHJldHVybiBwb3NpdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChzaXplLCBwb3NpdGlvbikge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHN0eWxlc1snYm9yZGVyLScgKyBwb3NpdGlvbiArICctd2lkdGgnXTtcclxuICAgICAgICByZXR1cm4gc2l6ZSArIHRvRmxvYXQodmFsdWUpO1xyXG4gICAgfSwgMCk7XHJcbn1cclxuLyoqXHJcbiAqIEV4dHJhY3RzIHBhZGRpbmdzIHNpemVzIGZyb20gcHJvdmlkZWQgc3R5bGVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0NTU1N0eWxlRGVjbGFyYXRpb259IHN0eWxlc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBQYWRkaW5ncyBib3guXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRQYWRkaW5ncyhzdHlsZXMpIHtcclxuICAgIHZhciBwb3NpdGlvbnMgPSBbJ3RvcCcsICdyaWdodCcsICdib3R0b20nLCAnbGVmdCddO1xyXG4gICAgdmFyIHBhZGRpbmdzID0ge307XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIHBvc2l0aW9uc18xID0gcG9zaXRpb25zOyBfaSA8IHBvc2l0aW9uc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IHBvc2l0aW9uc18xW19pXTtcclxuICAgICAgICB2YXIgdmFsdWUgPSBzdHlsZXNbJ3BhZGRpbmctJyArIHBvc2l0aW9uXTtcclxuICAgICAgICBwYWRkaW5nc1twb3NpdGlvbl0gPSB0b0Zsb2F0KHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYWRkaW5ncztcclxufVxyXG4vKipcclxuICogQ2FsY3VsYXRlcyBjb250ZW50IHJlY3RhbmdsZSBvZiBwcm92aWRlZCBTVkcgZWxlbWVudC5cclxuICpcclxuICogQHBhcmFtIHtTVkdHcmFwaGljc0VsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgY29udGVudCByZWN0YW5nbGUgb2Ygd2hpY2ggbmVlZHNcclxuICogICAgICB0byBiZSBjYWxjdWxhdGVkLlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdEluaXR9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTVkdDb250ZW50UmVjdCh0YXJnZXQpIHtcclxuICAgIHZhciBiYm94ID0gdGFyZ2V0LmdldEJCb3goKTtcclxuICAgIHJldHVybiBjcmVhdGVSZWN0SW5pdCgwLCAwLCBiYm94LndpZHRoLCBiYm94LmhlaWdodCk7XHJcbn1cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgY29udGVudCByZWN0YW5nbGUgb2YgcHJvdmlkZWQgSFRNTEVsZW1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgZm9yIHdoaWNoIHRvIGNhbGN1bGF0ZSB0aGUgY29udGVudCByZWN0YW5nbGUuXHJcbiAqIEByZXR1cm5zIHtET01SZWN0SW5pdH1cclxuICovXHJcbmZ1bmN0aW9uIGdldEhUTUxFbGVtZW50Q29udGVudFJlY3QodGFyZ2V0KSB7XHJcbiAgICAvLyBDbGllbnQgd2lkdGggJiBoZWlnaHQgcHJvcGVydGllcyBjYW4ndCBiZVxyXG4gICAgLy8gdXNlZCBleGNsdXNpdmVseSBhcyB0aGV5IHByb3ZpZGUgcm91bmRlZCB2YWx1ZXMuXHJcbiAgICB2YXIgY2xpZW50V2lkdGggPSB0YXJnZXQuY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodCA9IHRhcmdldC5jbGllbnRIZWlnaHQ7XHJcbiAgICAvLyBCeSB0aGlzIGNvbmRpdGlvbiB3ZSBjYW4gY2F0Y2ggYWxsIG5vbi1yZXBsYWNlZCBpbmxpbmUsIGhpZGRlbiBhbmRcclxuICAgIC8vIGRldGFjaGVkIGVsZW1lbnRzLiBUaG91Z2ggZWxlbWVudHMgd2l0aCB3aWR0aCAmIGhlaWdodCBwcm9wZXJ0aWVzIGxlc3NcclxuICAgIC8vIHRoYW4gMC41IHdpbGwgYmUgZGlzY2FyZGVkIGFzIHdlbGwuXHJcbiAgICAvL1xyXG4gICAgLy8gV2l0aG91dCBpdCB3ZSB3b3VsZCBuZWVkIHRvIGltcGxlbWVudCBzZXBhcmF0ZSBtZXRob2RzIGZvciBlYWNoIG9mXHJcbiAgICAvLyB0aG9zZSBjYXNlcyBhbmQgaXQncyBub3QgcG9zc2libGUgdG8gcGVyZm9ybSBhIHByZWNpc2UgYW5kIHBlcmZvcm1hbmNlXHJcbiAgICAvLyBlZmZlY3RpdmUgdGVzdCBmb3IgaGlkZGVuIGVsZW1lbnRzLiBFLmcuIGV2ZW4galF1ZXJ5J3MgJzp2aXNpYmxlJyBmaWx0ZXJcclxuICAgIC8vIGdpdmVzIHdyb25nIHJlc3VsdHMgZm9yIGVsZW1lbnRzIHdpdGggd2lkdGggJiBoZWlnaHQgbGVzcyB0aGFuIDAuNS5cclxuICAgIGlmICghY2xpZW50V2lkdGggJiYgIWNsaWVudEhlaWdodCkge1xyXG4gICAgICAgIHJldHVybiBlbXB0eVJlY3Q7XHJcbiAgICB9XHJcbiAgICB2YXIgc3R5bGVzID0gZ2V0V2luZG93T2YodGFyZ2V0KS5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCk7XHJcbiAgICB2YXIgcGFkZGluZ3MgPSBnZXRQYWRkaW5ncyhzdHlsZXMpO1xyXG4gICAgdmFyIGhvcml6UGFkID0gcGFkZGluZ3MubGVmdCArIHBhZGRpbmdzLnJpZ2h0O1xyXG4gICAgdmFyIHZlcnRQYWQgPSBwYWRkaW5ncy50b3AgKyBwYWRkaW5ncy5ib3R0b207XHJcbiAgICAvLyBDb21wdXRlZCBzdHlsZXMgb2Ygd2lkdGggJiBoZWlnaHQgYXJlIGJlaW5nIHVzZWQgYmVjYXVzZSB0aGV5IGFyZSB0aGVcclxuICAgIC8vIG9ubHkgZGltZW5zaW9ucyBhdmFpbGFibGUgdG8gSlMgdGhhdCBjb250YWluIG5vbi1yb3VuZGVkIHZhbHVlcy4gSXQgY291bGRcclxuICAgIC8vIGJlIHBvc3NpYmxlIHRvIHV0aWxpemUgdGhlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpZiBvbmx5IGl0J3MgZGF0YSB3YXNuJ3RcclxuICAgIC8vIGFmZmVjdGVkIGJ5IENTUyB0cmFuc2Zvcm1hdGlvbnMgbGV0IGFsb25lIHBhZGRpbmdzLCBib3JkZXJzIGFuZCBzY3JvbGwgYmFycy5cclxuICAgIHZhciB3aWR0aCA9IHRvRmxvYXQoc3R5bGVzLndpZHRoKSwgaGVpZ2h0ID0gdG9GbG9hdChzdHlsZXMuaGVpZ2h0KTtcclxuICAgIC8vIFdpZHRoICYgaGVpZ2h0IGluY2x1ZGUgcGFkZGluZ3MgYW5kIGJvcmRlcnMgd2hlbiB0aGUgJ2JvcmRlci1ib3gnIGJveFxyXG4gICAgLy8gbW9kZWwgaXMgYXBwbGllZCAoZXhjZXB0IGZvciBJRSkuXHJcbiAgICBpZiAoc3R5bGVzLmJveFNpemluZyA9PT0gJ2JvcmRlci1ib3gnKSB7XHJcbiAgICAgICAgLy8gRm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIHJlcXVpcmVkIHRvIGhhbmRsZSBJbnRlcm5ldCBFeHBsb3JlciB3aGljaFxyXG4gICAgICAgIC8vIGRvZXNuJ3QgaW5jbHVkZSBwYWRkaW5ncyBhbmQgYm9yZGVycyB0byBjb21wdXRlZCBDU1MgZGltZW5zaW9ucy5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFdlIGNhbiBzYXkgdGhhdCBpZiBDU1MgZGltZW5zaW9ucyArIHBhZGRpbmdzIGFyZSBlcXVhbCB0byB0aGUgXCJjbGllbnRcIlxyXG4gICAgICAgIC8vIHByb3BlcnRpZXMgdGhlbiBpdCdzIGVpdGhlciBJRSwgYW5kIHRodXMgd2UgZG9uJ3QgbmVlZCB0byBzdWJ0cmFjdFxyXG4gICAgICAgIC8vIGFueXRoaW5nLCBvciBhbiBlbGVtZW50IG1lcmVseSBkb2Vzbid0IGhhdmUgcGFkZGluZ3MvYm9yZGVycyBzdHlsZXMuXHJcbiAgICAgICAgaWYgKE1hdGgucm91bmQod2lkdGggKyBob3JpelBhZCkgIT09IGNsaWVudFdpZHRoKSB7XHJcbiAgICAgICAgICAgIHdpZHRoIC09IGdldEJvcmRlcnNTaXplKHN0eWxlcywgJ2xlZnQnLCAncmlnaHQnKSArIGhvcml6UGFkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTWF0aC5yb3VuZChoZWlnaHQgKyB2ZXJ0UGFkKSAhPT0gY2xpZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGhlaWdodCAtPSBnZXRCb3JkZXJzU2l6ZShzdHlsZXMsICd0b3AnLCAnYm90dG9tJykgKyB2ZXJ0UGFkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEZvbGxvd2luZyBzdGVwcyBjYW4ndCBiZSBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCdzIHJvb3QgZWxlbWVudCBhcyBpdHNcclxuICAgIC8vIGNsaWVudFtXaWR0aC9IZWlnaHRdIHByb3BlcnRpZXMgcmVwcmVzZW50IHZpZXdwb3J0IGFyZWEgb2YgdGhlIHdpbmRvdy5cclxuICAgIC8vIEJlc2lkZXMsIGl0J3MgYXMgd2VsbCBub3QgbmVjZXNzYXJ5IGFzIHRoZSA8aHRtbD4gaXRzZWxmIG5laXRoZXIgaGFzXHJcbiAgICAvLyByZW5kZXJlZCBzY3JvbGwgYmFycyBub3IgaXQgY2FuIGJlIGNsaXBwZWQuXHJcbiAgICBpZiAoIWlzRG9jdW1lbnRFbGVtZW50KHRhcmdldCkpIHtcclxuICAgICAgICAvLyBJbiBzb21lIGJyb3dzZXJzIChvbmx5IGluIEZpcmVmb3gsIGFjdHVhbGx5KSBDU1Mgd2lkdGggJiBoZWlnaHRcclxuICAgICAgICAvLyBpbmNsdWRlIHNjcm9sbCBiYXJzIHNpemUgd2hpY2ggY2FuIGJlIHJlbW92ZWQgYXQgdGhpcyBzdGVwIGFzIHNjcm9sbFxyXG4gICAgICAgIC8vIGJhcnMgYXJlIHRoZSBvbmx5IGRpZmZlcmVuY2UgYmV0d2VlbiByb3VuZGVkIGRpbWVuc2lvbnMgKyBwYWRkaW5nc1xyXG4gICAgICAgIC8vIGFuZCBcImNsaWVudFwiIHByb3BlcnRpZXMsIHRob3VnaCB0aGF0IGlzIG5vdCBhbHdheXMgdHJ1ZSBpbiBDaHJvbWUuXHJcbiAgICAgICAgdmFyIHZlcnRTY3JvbGxiYXIgPSBNYXRoLnJvdW5kKHdpZHRoICsgaG9yaXpQYWQpIC0gY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdmFyIGhvcml6U2Nyb2xsYmFyID0gTWF0aC5yb3VuZChoZWlnaHQgKyB2ZXJ0UGFkKSAtIGNsaWVudEhlaWdodDtcclxuICAgICAgICAvLyBDaHJvbWUgaGFzIGEgcmF0aGVyIHdlaXJkIHJvdW5kaW5nIG9mIFwiY2xpZW50XCIgcHJvcGVydGllcy5cclxuICAgICAgICAvLyBFLmcuIGZvciBhbiBlbGVtZW50IHdpdGggY29udGVudCB3aWR0aCBvZiAzMTQuMnB4IGl0IHNvbWV0aW1lcyBnaXZlc1xyXG4gICAgICAgIC8vIHRoZSBjbGllbnQgd2lkdGggb2YgMzE1cHggYW5kIGZvciB0aGUgd2lkdGggb2YgMzE0LjdweCBpdCBtYXkgZ2l2ZVxyXG4gICAgICAgIC8vIDMxNHB4LiBBbmQgaXQgZG9lc24ndCBoYXBwZW4gYWxsIHRoZSB0aW1lLiBTbyBqdXN0IGlnbm9yZSB0aGlzIGRlbHRhXHJcbiAgICAgICAgLy8gYXMgYSBub24tcmVsZXZhbnQuXHJcbiAgICAgICAgaWYgKE1hdGguYWJzKHZlcnRTY3JvbGxiYXIpICE9PSAxKSB7XHJcbiAgICAgICAgICAgIHdpZHRoIC09IHZlcnRTY3JvbGxiYXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNYXRoLmFicyhob3JpelNjcm9sbGJhcikgIT09IDEpIHtcclxuICAgICAgICAgICAgaGVpZ2h0IC09IGhvcml6U2Nyb2xsYmFyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjcmVhdGVSZWN0SW5pdChwYWRkaW5ncy5sZWZ0LCBwYWRkaW5ncy50b3AsIHdpZHRoLCBoZWlnaHQpO1xyXG59XHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBwcm92aWRlZCBlbGVtZW50IGlzIGFuIGluc3RhbmNlIG9mIHRoZSBTVkdHcmFwaGljc0VsZW1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCB0byBiZSBjaGVja2VkLlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbnZhciBpc1NWR0dyYXBoaWNzRWxlbWVudCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBTb21lIGJyb3dzZXJzLCBuYW1lbHkgSUUgYW5kIEVkZ2UsIGRvbid0IGhhdmUgdGhlIFNWR0dyYXBoaWNzRWxlbWVudFxyXG4gICAgLy8gaW50ZXJmYWNlLlxyXG4gICAgaWYgKHR5cGVvZiBTVkdHcmFwaGljc0VsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHsgcmV0dXJuIHRhcmdldCBpbnN0YW5jZW9mIGdldFdpbmRvd09mKHRhcmdldCkuU1ZHR3JhcGhpY3NFbGVtZW50OyB9O1xyXG4gICAgfVxyXG4gICAgLy8gSWYgaXQncyBzbywgdGhlbiBjaGVjayB0aGF0IGVsZW1lbnQgaXMgYXQgbGVhc3QgYW4gaW5zdGFuY2Ugb2YgdGhlXHJcbiAgICAvLyBTVkdFbGVtZW50IGFuZCB0aGF0IGl0IGhhcyB0aGUgXCJnZXRCQm94XCIgbWV0aG9kLlxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWV4dHJhLXBhcmVuc1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHsgcmV0dXJuICh0YXJnZXQgaW5zdGFuY2VvZiBnZXRXaW5kb3dPZih0YXJnZXQpLlNWR0VsZW1lbnQgJiZcclxuICAgICAgICB0eXBlb2YgdGFyZ2V0LmdldEJCb3ggPT09ICdmdW5jdGlvbicpOyB9O1xyXG59KSgpO1xyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgcHJvdmlkZWQgZWxlbWVudCBpcyBhIGRvY3VtZW50IGVsZW1lbnQgKDxodG1sPikuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCB0byBiZSBjaGVja2VkLlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzRG9jdW1lbnRFbGVtZW50KHRhcmdldCkge1xyXG4gICAgcmV0dXJuIHRhcmdldCA9PT0gZ2V0V2luZG93T2YodGFyZ2V0KS5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbn1cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgYW4gYXBwcm9wcmlhdGUgY29udGVudCByZWN0YW5nbGUgZm9yIHByb3ZpZGVkIGh0bWwgb3Igc3ZnIGVsZW1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCBjb250ZW50IHJlY3RhbmdsZSBvZiB3aGljaCBuZWVkcyB0byBiZSBjYWxjdWxhdGVkLlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdEluaXR9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRDb250ZW50UmVjdCh0YXJnZXQpIHtcclxuICAgIGlmICghaXNCcm93c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIGVtcHR5UmVjdDtcclxuICAgIH1cclxuICAgIGlmIChpc1NWR0dyYXBoaWNzRWxlbWVudCh0YXJnZXQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFNWR0NvbnRlbnRSZWN0KHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZ2V0SFRNTEVsZW1lbnRDb250ZW50UmVjdCh0YXJnZXQpO1xyXG59XHJcbi8qKlxyXG4gKiBDcmVhdGVzIHJlY3RhbmdsZSB3aXRoIGFuIGludGVyZmFjZSBvZiB0aGUgRE9NUmVjdFJlYWRPbmx5LlxyXG4gKiBTcGVjOiBodHRwczovL2RyYWZ0cy5meHRmLm9yZy9nZW9tZXRyeS8jZG9tcmVjdHJlYWRvbmx5XHJcbiAqXHJcbiAqIEBwYXJhbSB7RE9NUmVjdEluaXR9IHJlY3RJbml0IC0gT2JqZWN0IHdpdGggcmVjdGFuZ2xlJ3MgeC95IGNvb3JkaW5hdGVzIGFuZCBkaW1lbnNpb25zLlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdFJlYWRPbmx5fVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlUmVhZE9ubHlSZWN0KF9hKSB7XHJcbiAgICB2YXIgeCA9IF9hLngsIHkgPSBfYS55LCB3aWR0aCA9IF9hLndpZHRoLCBoZWlnaHQgPSBfYS5oZWlnaHQ7XHJcbiAgICAvLyBJZiBET01SZWN0UmVhZE9ubHkgaXMgYXZhaWxhYmxlIHVzZSBpdCBhcyBhIHByb3RvdHlwZSBmb3IgdGhlIHJlY3RhbmdsZS5cclxuICAgIHZhciBDb25zdHIgPSB0eXBlb2YgRE9NUmVjdFJlYWRPbmx5ICE9PSAndW5kZWZpbmVkJyA/IERPTVJlY3RSZWFkT25seSA6IE9iamVjdDtcclxuICAgIHZhciByZWN0ID0gT2JqZWN0LmNyZWF0ZShDb25zdHIucHJvdG90eXBlKTtcclxuICAgIC8vIFJlY3RhbmdsZSdzIHByb3BlcnRpZXMgYXJlIG5vdCB3cml0YWJsZSBhbmQgbm9uLWVudW1lcmFibGUuXHJcbiAgICBkZWZpbmVDb25maWd1cmFibGUocmVjdCwge1xyXG4gICAgICAgIHg6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgICAgdG9wOiB5LFxyXG4gICAgICAgIHJpZ2h0OiB4ICsgd2lkdGgsXHJcbiAgICAgICAgYm90dG9tOiBoZWlnaHQgKyB5LFxyXG4gICAgICAgIGxlZnQ6IHhcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbn1cclxuLyoqXHJcbiAqIENyZWF0ZXMgRE9NUmVjdEluaXQgb2JqZWN0IGJhc2VkIG9uIHRoZSBwcm92aWRlZCBkaW1lbnNpb25zIGFuZCB0aGUgeC95IGNvb3JkaW5hdGVzLlxyXG4gKiBTcGVjOiBodHRwczovL2RyYWZ0cy5meHRmLm9yZy9nZW9tZXRyeS8jZGljdGRlZi1kb21yZWN0aW5pdFxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggY29vcmRpbmF0ZS5cclxuICogQHBhcmFtIHtudW1iZXJ9IHkgLSBZIGNvb3JkaW5hdGUuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFJlY3RhbmdsZSdzIHdpZHRoLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gUmVjdGFuZ2xlJ3MgaGVpZ2h0LlxyXG4gKiBAcmV0dXJucyB7RE9NUmVjdEluaXR9XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVSZWN0SW5pdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICByZXR1cm4geyB4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XHJcbn1cblxuLyoqXHJcbiAqIENsYXNzIHRoYXQgaXMgcmVzcG9uc2libGUgZm9yIGNvbXB1dGF0aW9ucyBvZiB0aGUgY29udGVudCByZWN0YW5nbGUgb2ZcclxuICogcHJvdmlkZWQgRE9NIGVsZW1lbnQgYW5kIGZvciBrZWVwaW5nIHRyYWNrIG9mIGl0J3MgY2hhbmdlcy5cclxuICovXHJcbnZhciBSZXNpemVPYnNlcnZhdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgdG8gYmUgb2JzZXJ2ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFJlc2l6ZU9ic2VydmF0aW9uKHRhcmdldCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEJyb2FkY2FzdGVkIHdpZHRoIG9mIGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFdpZHRoID0gMDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBCcm9hZGNhc3RlZCBoZWlnaHQgb2YgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0SGVpZ2h0ID0gMDtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIGxhc3Qgb2JzZXJ2ZWQgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7RE9NUmVjdEluaXR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jb250ZW50UmVjdF8gPSBjcmVhdGVSZWN0SW5pdCgwLCAwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyBjb250ZW50IHJlY3RhbmdsZSBhbmQgdGVsbHMgd2hldGhlciBpdCdzIHdpZHRoIG9yIGhlaWdodCBwcm9wZXJ0aWVzXHJcbiAgICAgKiBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYnJvYWRjYXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZhdGlvbi5wcm90b3R5cGUuaXNBY3RpdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBnZXRDb250ZW50UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50UmVjdF8gPSByZWN0O1xyXG4gICAgICAgIHJldHVybiAocmVjdC53aWR0aCAhPT0gdGhpcy5icm9hZGNhc3RXaWR0aCB8fFxyXG4gICAgICAgICAgICByZWN0LmhlaWdodCAhPT0gdGhpcy5icm9hZGNhc3RIZWlnaHQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyAnYnJvYWRjYXN0V2lkdGgnIGFuZCAnYnJvYWRjYXN0SGVpZ2h0JyBwcm9wZXJ0aWVzIHdpdGggYSBkYXRhXHJcbiAgICAgKiBmcm9tIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnRpZXMgb2YgdGhlIGxhc3Qgb2JzZXJ2ZWQgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0RPTVJlY3RJbml0fSBMYXN0IG9ic2VydmVkIGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZhdGlvbi5wcm90b3R5cGUuYnJvYWRjYXN0UmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuY29udGVudFJlY3RfO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0V2lkdGggPSByZWN0LndpZHRoO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0SGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlY3Q7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmF0aW9uO1xyXG59KCkpO1xuXG52YXIgUmVzaXplT2JzZXJ2ZXJFbnRyeSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlckVudHJ5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IC0gRWxlbWVudCB0aGF0IGlzIGJlaW5nIG9ic2VydmVkLlxyXG4gICAgICogQHBhcmFtIHtET01SZWN0SW5pdH0gcmVjdEluaXQgLSBEYXRhIG9mIHRoZSBlbGVtZW50J3MgY29udGVudCByZWN0YW5nbGUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFJlc2l6ZU9ic2VydmVyRW50cnkodGFyZ2V0LCByZWN0SW5pdCkge1xyXG4gICAgICAgIHZhciBjb250ZW50UmVjdCA9IGNyZWF0ZVJlYWRPbmx5UmVjdChyZWN0SW5pdCk7XHJcbiAgICAgICAgLy8gQWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpY2F0aW9uIGZvbGxvd2luZyBwcm9wZXJ0aWVzIGFyZSBub3Qgd3JpdGFibGVcclxuICAgICAgICAvLyBhbmQgYXJlIGFsc28gbm90IGVudW1lcmFibGUgaW4gdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbi5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFByb3BlcnR5IGFjY2Vzc29ycyBhcmUgbm90IGJlaW5nIHVzZWQgYXMgdGhleSdkIHJlcXVpcmUgdG8gZGVmaW5lIGFcclxuICAgICAgICAvLyBwcml2YXRlIFdlYWtNYXAgc3RvcmFnZSB3aGljaCBtYXkgY2F1c2UgbWVtb3J5IGxlYWtzIGluIGJyb3dzZXJzIHRoYXRcclxuICAgICAgICAvLyBkb24ndCBzdXBwb3J0IHRoaXMgdHlwZSBvZiBjb2xsZWN0aW9ucy5cclxuICAgICAgICBkZWZpbmVDb25maWd1cmFibGUodGhpcywgeyB0YXJnZXQ6IHRhcmdldCwgY29udGVudFJlY3Q6IGNvbnRlbnRSZWN0IH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmVyRW50cnk7XHJcbn0oKSk7XG5cbnZhciBSZXNpemVPYnNlcnZlclNQSSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlci5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1Jlc2l6ZU9ic2VydmVyQ2FsbGJhY2t9IGNhbGxiYWNrIC0gQ2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBpcyBpbnZva2VkXHJcbiAgICAgKiAgICAgIHdoZW4gb25lIG9mIHRoZSBvYnNlcnZlZCBlbGVtZW50cyBjaGFuZ2VzIGl0J3MgY29udGVudCBkaW1lbnNpb25zLlxyXG4gICAgICogQHBhcmFtIHtSZXNpemVPYnNlcnZlckNvbnRyb2xsZXJ9IGNvbnRyb2xsZXIgLSBDb250cm9sbGVyIGluc3RhbmNlIHdoaWNoXHJcbiAgICAgKiAgICAgIGlzIHJlc3BvbnNpYmxlIGZvciB0aGUgdXBkYXRlcyBvZiBvYnNlcnZlci5cclxuICAgICAqIEBwYXJhbSB7UmVzaXplT2JzZXJ2ZXJ9IGNhbGxiYWNrQ3R4IC0gUmVmZXJlbmNlIHRvIHRoZSBwdWJsaWNcclxuICAgICAqICAgICAgUmVzaXplT2JzZXJ2ZXIgaW5zdGFuY2Ugd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gY2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFJlc2l6ZU9ic2VydmVyU1BJKGNhbGxiYWNrLCBjb250cm9sbGVyLCBjYWxsYmFja0N0eCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbGxlY3Rpb24gb2YgcmVzaXplIG9ic2VydmF0aW9ucyB0aGF0IGhhdmUgZGV0ZWN0ZWQgY2hhbmdlcyBpbiBkaW1lbnNpb25zXHJcbiAgICAgICAgICogb2YgZWxlbWVudHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7QXJyYXk8UmVzaXplT2JzZXJ2YXRpb24+fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYWN0aXZlT2JzZXJ2YXRpb25zXyA9IFtdO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdHJ5IG9mIHRoZSBSZXNpemVPYnNlcnZhdGlvbiBpbnN0YW5jZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcHJpdmF0ZSB7TWFwPEVsZW1lbnQsIFJlc2l6ZU9ic2VydmF0aW9uPn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9ic2VydmF0aW9uc18gPSBuZXcgTWFwU2hpbSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGNhbGxiYWNrIHByb3ZpZGVkIGFzIHBhcmFtZXRlciAxIGlzIG5vdCBhIGZ1bmN0aW9uLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGxiYWNrXyA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuY29udHJvbGxlcl8gPSBjb250cm9sbGVyO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tDdHhfID0gY2FsbGJhY2tDdHg7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyBvYnNlcnZpbmcgcHJvdmlkZWQgZWxlbWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCAtIEVsZW1lbnQgdG8gYmUgb2JzZXJ2ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJTUEkucHJvdG90eXBlLm9ic2VydmUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJzEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3QgaGF2ZSB0aGUgRWxlbWVudCBpbnRlcmZhY2UuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJyB8fCAhKEVsZW1lbnQgaW5zdGFuY2VvZiBPYmplY3QpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgZ2V0V2luZG93T2YodGFyZ2V0KS5FbGVtZW50KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwYXJhbWV0ZXIgMSBpcyBub3Qgb2YgdHlwZSBcIkVsZW1lbnRcIi4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9ic2VydmF0aW9ucyA9IHRoaXMub2JzZXJ2YXRpb25zXztcclxuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIGVsZW1lbnQgaXMgYWxyZWFkeSBiZWluZyBvYnNlcnZlZC5cclxuICAgICAgICBpZiAob2JzZXJ2YXRpb25zLmhhcyh0YXJnZXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JzZXJ2YXRpb25zLnNldCh0YXJnZXQsIG5ldyBSZXNpemVPYnNlcnZhdGlvbih0YXJnZXQpKTtcclxuICAgICAgICB0aGlzLmNvbnRyb2xsZXJfLmFkZE9ic2VydmVyKHRoaXMpO1xyXG4gICAgICAgIC8vIEZvcmNlIHRoZSB1cGRhdGUgb2Ygb2JzZXJ2YXRpb25zLlxyXG4gICAgICAgIHRoaXMuY29udHJvbGxlcl8ucmVmcmVzaCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RvcHMgb2JzZXJ2aW5nIHByb3ZpZGVkIGVsZW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgLSBFbGVtZW50IHRvIHN0b3Agb2JzZXJ2aW5nLlxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIFJlc2l6ZU9ic2VydmVyU1BJLnByb3RvdHlwZS51bm9ic2VydmUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJzEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3QgaGF2ZSB0aGUgRWxlbWVudCBpbnRlcmZhY2UuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJyB8fCAhKEVsZW1lbnQgaW5zdGFuY2VvZiBPYmplY3QpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgZ2V0V2luZG93T2YodGFyZ2V0KS5FbGVtZW50KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwYXJhbWV0ZXIgMSBpcyBub3Qgb2YgdHlwZSBcIkVsZW1lbnRcIi4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9ic2VydmF0aW9ucyA9IHRoaXMub2JzZXJ2YXRpb25zXztcclxuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIGVsZW1lbnQgaXMgbm90IGJlaW5nIG9ic2VydmVkLlxyXG4gICAgICAgIGlmICghb2JzZXJ2YXRpb25zLmhhcyh0YXJnZXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JzZXJ2YXRpb25zLmRlbGV0ZSh0YXJnZXQpO1xyXG4gICAgICAgIGlmICghb2JzZXJ2YXRpb25zLnNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyXy5yZW1vdmVPYnNlcnZlcih0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wcyBvYnNlcnZpbmcgYWxsIGVsZW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlclNQSS5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsZWFyQWN0aXZlKCk7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZhdGlvbnNfLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9sbGVyXy5yZW1vdmVPYnNlcnZlcih0aGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbGxlY3RzIG9ic2VydmF0aW9uIGluc3RhbmNlcyB0aGUgYXNzb2NpYXRlZCBlbGVtZW50IG9mIHdoaWNoIGhhcyBjaGFuZ2VkXHJcbiAgICAgKiBpdCdzIGNvbnRlbnQgcmVjdGFuZ2xlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlclNQSS5wcm90b3R5cGUuZ2F0aGVyQWN0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jbGVhckFjdGl2ZSgpO1xyXG4gICAgICAgIHRoaXMub2JzZXJ2YXRpb25zXy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZhdGlvbikge1xyXG4gICAgICAgICAgICBpZiAob2JzZXJ2YXRpb24uaXNBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuYWN0aXZlT2JzZXJ2YXRpb25zXy5wdXNoKG9ic2VydmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogSW52b2tlcyBpbml0aWFsIGNhbGxiYWNrIGZ1bmN0aW9uIHdpdGggYSBsaXN0IG9mIFJlc2l6ZU9ic2VydmVyRW50cnlcclxuICAgICAqIGluc3RhbmNlcyBjb2xsZWN0ZWQgZnJvbSBhY3RpdmUgcmVzaXplIG9ic2VydmF0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJTUEkucHJvdG90eXBlLmJyb2FkY2FzdEFjdGl2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIG9ic2VydmVyIGRvZXNuJ3QgaGF2ZSBhY3RpdmUgb2JzZXJ2YXRpb25zLlxyXG4gICAgICAgIGlmICghdGhpcy5oYXNBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjdHggPSB0aGlzLmNhbGxiYWNrQ3R4XztcclxuICAgICAgICAvLyBDcmVhdGUgUmVzaXplT2JzZXJ2ZXJFbnRyeSBpbnN0YW5jZSBmb3IgZXZlcnkgYWN0aXZlIG9ic2VydmF0aW9uLlxyXG4gICAgICAgIHZhciBlbnRyaWVzID0gdGhpcy5hY3RpdmVPYnNlcnZhdGlvbnNfLm1hcChmdW5jdGlvbiAob2JzZXJ2YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXNpemVPYnNlcnZlckVudHJ5KG9ic2VydmF0aW9uLnRhcmdldCwgb2JzZXJ2YXRpb24uYnJvYWRjYXN0UmVjdCgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrXy5jYWxsKGN0eCwgZW50cmllcywgY3R4KTtcclxuICAgICAgICB0aGlzLmNsZWFyQWN0aXZlKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIGNvbGxlY3Rpb24gb2YgYWN0aXZlIG9ic2VydmF0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgUmVzaXplT2JzZXJ2ZXJTUEkucHJvdG90eXBlLmNsZWFyQWN0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlT2JzZXJ2YXRpb25zXy5zcGxpY2UoMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxscyB3aGV0aGVyIG9ic2VydmVyIGhhcyBhY3RpdmUgb2JzZXJ2YXRpb25zLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBSZXNpemVPYnNlcnZlclNQSS5wcm90b3R5cGUuaGFzQWN0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU9ic2VydmF0aW9uc18ubGVuZ3RoID4gMDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUmVzaXplT2JzZXJ2ZXJTUEk7XHJcbn0oKSk7XG5cbi8vIFJlZ2lzdHJ5IG9mIGludGVybmFsIG9ic2VydmVycy4gSWYgV2Vha01hcCBpcyBub3QgYXZhaWxhYmxlIHVzZSBjdXJyZW50IHNoaW1cclxuLy8gZm9yIHRoZSBNYXAgY29sbGVjdGlvbiBhcyBpdCBoYXMgYWxsIHJlcXVpcmVkIG1ldGhvZHMgYW5kIGJlY2F1c2UgV2Vha01hcFxyXG4vLyBjYW4ndCBiZSBmdWxseSBwb2x5ZmlsbGVkIGFueXdheS5cclxudmFyIG9ic2VydmVycyA9IHR5cGVvZiBXZWFrTWFwICE9PSAndW5kZWZpbmVkJyA/IG5ldyBXZWFrTWFwKCkgOiBuZXcgTWFwU2hpbSgpO1xyXG4vKipcclxuICogUmVzaXplT2JzZXJ2ZXIgQVBJLiBFbmNhcHN1bGF0ZXMgdGhlIFJlc2l6ZU9ic2VydmVyIFNQSSBpbXBsZW1lbnRhdGlvblxyXG4gKiBleHBvc2luZyBvbmx5IHRob3NlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgdGhhdCBhcmUgZGVmaW5lZCBpbiB0aGUgc3BlYy5cclxuICovXHJcbnZhciBSZXNpemVPYnNlcnZlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBSZXNpemVPYnNlcnZlci5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1Jlc2l6ZU9ic2VydmVyQ2FsbGJhY2t9IGNhbGxiYWNrIC0gQ2FsbGJhY2sgdGhhdCBpcyBpbnZva2VkIHdoZW5cclxuICAgICAqICAgICAgZGltZW5zaW9ucyBvZiB0aGUgb2JzZXJ2ZWQgZWxlbWVudHMgY2hhbmdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBSZXNpemVPYnNlcnZlcihjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSZXNpemVPYnNlcnZlcikpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignMSBhcmd1bWVudCByZXF1aXJlZCwgYnV0IG9ubHkgMCBwcmVzZW50LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29udHJvbGxlciA9IFJlc2l6ZU9ic2VydmVyQ29udHJvbGxlci5nZXRJbnN0YW5jZSgpO1xyXG4gICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlclNQSShjYWxsYmFjaywgY29udHJvbGxlciwgdGhpcyk7XHJcbiAgICAgICAgb2JzZXJ2ZXJzLnNldCh0aGlzLCBvYnNlcnZlcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUmVzaXplT2JzZXJ2ZXI7XHJcbn0oKSk7XHJcbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcyBvZiBSZXNpemVPYnNlcnZlci5cclxuW1xyXG4gICAgJ29ic2VydmUnLFxyXG4gICAgJ3Vub2JzZXJ2ZScsXHJcbiAgICAnZGlzY29ubmVjdCdcclxuXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcclxuICAgIFJlc2l6ZU9ic2VydmVyLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICByZXR1cm4gKF9hID0gb2JzZXJ2ZXJzLmdldCh0aGlzKSlbbWV0aG9kXS5hcHBseShfYSwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn0pO1xuXG52YXIgaW5kZXggPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gRXhwb3J0IGV4aXN0aW5nIGltcGxlbWVudGF0aW9uIGlmIGF2YWlsYWJsZS5cclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsJDEuUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbCQxLlJlc2l6ZU9ic2VydmVyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFJlc2l6ZU9ic2VydmVyO1xyXG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBpbmRleDtcbiIsImltcG9ydCB7IGJ1YmJsZSwgbGlzdGVuIH0gZnJvbSBcInN2ZWx0ZS9pbnRlcm5hbFwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV2ZW50c0FjdGlvbihjb21wb25lbnQpIHtcbiAgcmV0dXJuIChub2RlKSA9PiB7XG4gICAgY29uc3QgZXZlbnRzID0gT2JqZWN0LmtleXMoY29tcG9uZW50LiQkLmNhbGxiYWNrcyk7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gW107XG5cbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IGxpc3RlbmVycy5wdXNoKGxpc3Rlbihub2RlLCBldmVudCwgKGUpID0+IGJ1YmJsZShjb21wb25lbnQsIGUpKSkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Ryb3k6ICgpID0+IHtcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfTtcbn1cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlIH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBvcmllbnRhdGlvblxuICAgKiBAdHlwZSB7XCJob3Jpem9udGFsXCIgfCBcInZlcnRpY2FsXCJ9W29yaWVudGF0aW9uPVwiaG9yaXpvbnRhbFwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBvcmllbnRhdGlvbiA9IFwiaG9yaXpvbnRhbFwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSB2YXJpYW50cyBvZiBhY3Rpb24gZ3JvdXBcbiAgICogQHR5cGUge1wiZ2VuZXJhbFwiIHwgXCJqdXN0aWZpZWRcIn1bdmFyaWFudHMgPSBcImp1c3RpZmllZFwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCB2YXJpYW50cyA9IFwiZ2VuZXJhbFwiO1xuXG4gIC8qKlxuICAgKiBXaGVuIHZhcmlhbnRzPT09XCJqdXN0aWZpZWRcIiwgc2V0IGl0cyBkaW1lbnNpb27jgIJcbiAgICogQHR5cGUge0RpbWVuc2lvbn1bZGltZW5zaW9uID0gXCJcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGltZW5zaW9uID0gXCJcIjtcblxuICAvKipcbiAgICogSXMgaXQgYSBvbmx5IGljb24gb2YgYWN0aW9uIGdyb3VwXG4gICAqIEB0eXBlIHtib29sZWFufVtvbmx5SWNvbj1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgb25seUljb24gPSBmYWxzZTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgYWN0aW9uIGdyb3VwIGlzIGluIHF1aWV0IHN0YXRlXG4gICAqIEB0eXBlIHtib29sZWFufVtpc1F1aWV0PWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc1F1aWV0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGFjdGlvbiBncm91cCBpcyBpbiBjb21wYWN0IHN0YXRlXG4gICAqIEB0eXBlIHtib29sZWFufVtpc0NvbXBhY3Q9ZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzQ29tcGFjdCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBlbXBoYXNpemVkIHN0YXR1cyBvZiBidXR0b24gZ3JvdXBcbiAgICogQHR5cGUgeyBib29sZWFuIH0gW2VtcGhhc2l6ZWQ9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBlbXBoYXNpemVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIERpc2FibGUgYWxsIGFjdGlvbiBidXR0b25zXG4gICAqIEB0eXBlIHtib29sZWFufVtkaXNhYmxlZD1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcblxuICBsZXQgYWN0aW9uR3JvdXA7XG4gIGZ1bmN0aW9uIGFkZENoaWxkQ2xhc3NOYW1lKCkge1xuICAgIGxldCBidXR0b25DbGFzc05hbWUgPSBbXG4gICAgICBcIiBzcGVjdHJ1bS1BY3Rpb25Hcm91cC1pdGVtXCIsXG4gICAgICBpc1F1aWV0ICYmIFwic3BlY3RydW0tQWN0aW9uQnV0dG9uLS1xdWlldFwiLFxuICAgICAgZW1waGFzaXplZCAmJiBcInNwZWN0cnVtLUFjdGlvbkJ1dHRvbi0tZW1waGFzaXplZFwiLFxuICAgIF1cbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgIC5qb2luKFwiIFwiKTtcbiAgICBpZiAoYWN0aW9uR3JvdXApIHtcbiAgICAgIGNvbnN0IGJ1dHRvbkl0ZW0gPSBhY3Rpb25Hcm91cC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3BlY3RydW0tQWN0aW9uQnV0dG9uXCIpO1xuICAgICAgaWYgKGJ1dHRvbkl0ZW0ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBidXR0b25JdGVtLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgYnV0dG9uSXRlbVtpbmRleF0uc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgZGlzYWJsZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBidXR0b25JdGVtW2luZGV4XS5jbGFzc05hbWUgPSBidXR0b25JdGVtW2luZGV4XS5jbGFzc05hbWUgKyBidXR0b25DbGFzc05hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvbmx5SWNvbiAmJiB2YXJpYW50cyA9PT0gXCJnZW5lcmFsXCIpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uV3JhcEl0ZW0gPSBhY3Rpb25Hcm91cC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3BlY3RydW0tQnV0dG9uLXdyYXBcIik7XG4gICAgICAgIGlmIChidXR0b25XcmFwSXRlbS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYnV0dG9uV3JhcEl0ZW0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBidXR0b25XcmFwSXRlbVtpbmRleF0uY2xhc3NOYW1lID0gYnV0dG9uV3JhcEl0ZW1baW5kZXhdLmNsYXNzTmFtZSArIFwiIHJ1YnVzLWJ1dHRvbi13cmFwXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWZ0ZXJVcGRhdGUoKCkgPT4ge1xuICAgIGFkZENoaWxkQ2xhc3NOYW1lKCk7XG4gIH0pO1xuXG4gICQ6IHN0eWxlQ3NzVGV4dCA9IFtcbiAgICB2YXJpYW50cyA9PT0gXCJqdXN0aWZpZWRcIiAmJlxuICAgICAgb3JpZW50YXRpb24gPT09IFwiaG9yaXpvbnRhbFwiICYmXG4gICAgICBgd2lkdGg6dmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi0ke2RpbWVuc2lvbn0sIHZhcigtLXNwZWN0cnVtLWFsaWFzLSR7ZGltZW5zaW9ufSkpYCxcbiAgICB2YXJpYW50cyA9PT0gXCJqdXN0aWZpZWRcIiAmJlxuICAgICAgb3JpZW50YXRpb24gPT09IFwidmVydGljYWxcIiAmJlxuICAgICAgYGhlaWdodDp2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLSR7ZGltZW5zaW9ufSwgdmFyKC0tc3BlY3RydW0tYWxpYXMtJHtkaW1lbnNpb259KSlgLFxuICBdXG4gICAgLmZpbHRlcihCb29sZWFuKVxuICAgIC5qb2luKFwiIFwiKTtcbjwvc2NyaXB0PlxuXG48ZGl2XG4gIGNsYXNzPVwic3BlY3RydW0tQWN0aW9uR3JvdXBcIlxuICBzdHlsZT17c3R5bGVDc3NUZXh0fVxuICBjbGFzczpzcGVjdHJ1bS1BY3Rpb25Hcm91cC0tanVzdGlmaWVkPXt2YXJpYW50cyA9PT0gJ2p1c3RpZmllZCd9XG4gIGNsYXNzOnNwZWN0cnVtLUFjdGlvbkdyb3VwLS12ZXJ0aWNhbD17b3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCd9XG4gIGNsYXNzOnNwZWN0cnVtLUFjdGlvbkdyb3VwLS1xdWlldD17aXNRdWlldH1cbiAgY2xhc3M6c3BlY3RydW0tQWN0aW9uR3JvdXAtLWNvbXBhY3Q9e2lzQ29tcGFjdH1cbiAgYmluZDp0aGlzPXthY3Rpb25Hcm91cH0+XG4gIDxzbG90IC8+XG48L2Rpdj5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGN1cnJlbnRfY29tcG9uZW50IH0gZnJvbSBcInN2ZWx0ZS9pbnRlcm5hbFwiO1xuICBpbXBvcnQgeyBnZXRFdmVudHNBY3Rpb24gfSBmcm9tIFwiLi4vdXRpbHMvZ2V0LWV2ZW50cy1hY3Rpb24uanNcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgdGFiaW5kZXhcbiAgICogQHR5cGUge3N0cmluZ31bdGFiaW5kZXg9XCIwXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHRhYmluZGV4ID0gMDtcblxuICAvKipcbiAgICogU2V0IHRvIGB0cnVlYCB0byBkaXNhYmxlIHRoZSBidXR0b25cbiAgICogQHR5cGUge2Jvb2xlYW59W2Rpc2FibGVkPWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBpZFxuICAgKiBAdHlwZSB7c3RyaW5nfVtpZD1cIlwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpZCA9IFwiXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGFyaWEtbGFiZWxcbiAgICogQHR5cGUge3N0cmluZ30gW2FyaWEtbGFiZWw9XCJidXR0b25cIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgYXJpYUxhYmVsID0gXCJidXR0b25cIjtcblxuICAvKipcbiAgICogU2V0IHRoZSBgaHJlZmAgdG8gdXNlIGFuIGFuY2hvciBsaW5rXG4gICAqIEB0eXBlIHtzdHJpbmd9W2hyZWYgPSBcIlwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBocmVmID0gXCJcIjtcbiAgLyoqXG4gICAqIFByZWNvbmRpdGlvbnM6IGhyZWZcbiAgICogV2hlcmUgdG8gZGlzcGxheSB0aGUgbGlua2VkIFVSTFxuICAgKiBAdHlwZSB7XCJfc2VsZlwiIHwgXCJfYmxhbmtcIiB8IFwiX3BhcmVudFwiIHwgXCJfdG9wXCJ9W3RhcmdldCA9IFwiXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHRhcmdldCA9IFwiXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGB0eXBlYCBhdHRyaWJ1dGUgZm9yIHRoZSBidXR0b24gZWxlbWVudFxuICAgKiBAdHlwZSB7XCJidXR0b25cInxcInN1Ym1pdFwifFwicmVzZXRcIn1bdHlwZT1cImJ1dHRvblwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCB0eXBlID0gXCJidXR0b25cIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZXh0ZXJpb3Igb2YgYnV0dG9uXG4gICAqIEB0eXBlIHtcImdlbmVyYWxcIiB8IFwiY2xlYXJcIiB8IFwibG9naWMtb3JcIiB8IFwibG9naWMtYW5kXCIgIHxcImFjdGlvblwifSBbZXh0ZXJpb3I9XCJnZW5lcmFsXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGV4dGVyaW9yID0gXCJnZW5lcmFsXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHZhcmlhbnQgb2YgYnV0dG9uXG4gICAqIEB0eXBlIHtcImN0YVwiIHwgXCJvdmVyQmFja2dyb3VuZFwiIHwgXCJwcmltYXJ5XCIgfCBcInNlY29uZGFyeVwiIHwgXCJ3YXJuaW5nXCJ9IFt2YXJpYW50PVwiY3RhXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHZhcmlhbnQgPSBcImN0YVwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBxdWlldCBtb2RlIG9mIGJ1dHRvblxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNRdWlldD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzUXVpZXQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgc2VsZWN0ZWQgc3RhdHVzIG9mIGJ1dHRvblxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNTZWxlY3RlZD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzU2VsZWN0ZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogUHJlY29uZGl0aW9uczogZXh0ZXJpb3IgPT09IFwiY2xlYXJcIlxuICAgKiBTcGVjaWZ5IHRoZSBzbWFsbCBtb2RlIG9mIGJ1dHRvblxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNTbWFsbD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzU21hbGwgPSBmYWxzZTtcblxuICAvKipcbiAgICogUHJlY29uZGl0aW9uczogZXh0ZXJpb3IgPT09IFwiYWN0aW9uXCJcbiAgICogU3BlY2lmeSB0aGUgZW1waGFzaXplZCBzdGF0dXMgb2YgYnV0dG9uXG4gICAqIEB0eXBlIHsgYm9vbGVhbiB9IFtlbXBoYXNpemVkPSBmYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZW1waGFzaXplZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBQcmVjb25kaXRpb25zOiBkaXNhYmxlZCA9PT0gdHJ1ZVxuICAgKiBDdXJzb3Igbm90LWFsbG93ZWQgd2hlbiB0aGUgYnV0dG9uIGlzIGRpc2FibGVkXG4gICAqIEB0eXBlIHsgYm9vbGVhbiB9IFtub3RBbGxvd2VkPSBmYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgbm90QWxsb3dlZCA9IGZhbHNlO1xuXG4gIGNvbnN0IGV2ZW50c0xpc3RlbiA9IGdldEV2ZW50c0FjdGlvbihjdXJyZW50X2NvbXBvbmVudCk7XG4gICQ6IGJ1dHRvblByb3BzID0ge1xuICAgIGlkLFxuICAgIHR5cGUsXG4gICAgcm9sZTogXCJidXR0b25cIixcbiAgICB0YWJpbmRleCxcbiAgICBkaXNhYmxlZCxcbiAgICAuLi4kJHJlc3RQcm9wcyxcbiAgICBjbGFzczogW1xuICAgICAgZXh0ZXJpb3IgPT09IFwiZ2VuZXJhbFwiICYmIFwic3BlY3RydW0tQnV0dG9uXCIsXG4gICAgICBleHRlcmlvciA9PT0gXCJnZW5lcmFsXCIgJiYgYHNwZWN0cnVtLUJ1dHRvbi0tJHt2YXJpYW50fWAsXG4gICAgICBleHRlcmlvciA9PT0gXCJnZW5lcmFsXCIgJiYgaXNRdWlldCAmJiBgc3BlY3RydW0tQnV0dG9uLS1xdWlldGAsXG4gICAgICBleHRlcmlvciA9PT0gXCJjbGVhclwiICYmIFwic3BlY3RydW0tQ2xlYXJCdXR0b25cIixcbiAgICAgIGV4dGVyaW9yID09PSBcImNsZWFyXCIgJiYgYHNwZWN0cnVtLUNsZWFyQnV0dG9uLS0ke3ZhcmlhbnR9YCxcbiAgICAgIGV4dGVyaW9yID09PSBcImNsZWFyXCIgJiYgKGlzU21hbGwgPyBcInNwZWN0cnVtLUNsZWFyQnV0dG9uLS1zbWFsbFwiIDogXCJzcGVjdHJ1bS1DbGVhckJ1dHRvbi0tbWVkaXVtXCIpLFxuICAgICAgZXh0ZXJpb3IgPT09IFwibG9naWMtb3JcIiAmJiBcInNwZWN0cnVtLUxvZ2ljQnV0dG9uIHNwZWN0cnVtLUxvZ2ljQnV0dG9uLS1vclwiLFxuICAgICAgZXh0ZXJpb3IgPT09IFwibG9naWMtYW5kXCIgJiYgXCJzcGVjdHJ1bS1Mb2dpY0J1dHRvbiBzcGVjdHJ1bS1Mb2dpY0J1dHRvbi0tYW5kXCIsXG4gICAgICBleHRlcmlvciA9PT0gXCJhY3Rpb25cIiAmJiBcInNwZWN0cnVtLUFjdGlvbkJ1dHRvblwiLFxuICAgICAgZXh0ZXJpb3IgPT09IFwiYWN0aW9uXCIgJiYgaXNRdWlldCAmJiBgc3BlY3RydW0tQWN0aW9uQnV0dG9uLS1xdWlldGAsXG4gICAgICBleHRlcmlvciA9PT0gXCJhY3Rpb25cIiAmJiBlbXBoYXNpemVkICYmIFwic3BlY3RydW0tQWN0aW9uQnV0dG9uLS1lbXBoYXNpemVkXCIsXG4gICAgICBpc1NlbGVjdGVkICYmIFwiaXMtc2VsZWN0ZWRcIixcbiAgICAgIGRpc2FibGVkICYmIG5vdEFsbG93ZWQgJiYgXCJub3QtYWxsb3dlZFwiLFxuICAgICAgYCR7JCRyZXN0UHJvcHMuY2xhc3N9YCxcbiAgICBdXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAuam9pbihcIiBcIiksXG4gIH07XG48L3NjcmlwdD5cblxuPHN0eWxlIGdsb2JhbD5cbiAgLm5vdC1hbGxvd2VkOmRpc2FibGVkIHtcbiAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICB9XG48L3N0eWxlPlxuXG57I2lmIGhyZWZ9XG4gIDxhIHsuLi5idXR0b25Qcm9wc30gYXJpYS1sYWJlbD17YXJpYUxhYmVsfSB7aHJlZn0ge3RhcmdldH0gdXNlOmV2ZW50c0xpc3Rlbj5cbiAgICB7I2lmIGV4dGVyaW9yID09ICdjbGVhcicgfHwgZXh0ZXJpb3IgPT0gJ2xvZ2ljLW9yJyB8fCBleHRlcmlvciA9PSAnbG9naWMtYW5kJ31cbiAgICAgIDxzbG90IC8+XG4gICAgezplbHNlfVxuICAgICAgPHNsb3QgbmFtZT1cImJ1dHRvbi1pY29uXCIgLz5cbiAgICAgIDxzcGFuIGNsYXNzPVwic3BlY3RydW0te2V4dGVyaW9yID09ICdhY3Rpb24nID8gJ0FjdGlvbkJ1dHRvbicgOiAnQnV0dG9uJ30tbGFiZWxcIj5cbiAgICAgICAgPHNsb3QgLz5cbiAgICAgIDwvc3Bhbj5cbiAgICB7L2lmfVxuICA8L2E+XG57OmVsc2V9XG4gIDxidXR0b24gey4uLmJ1dHRvblByb3BzfSBhcmlhLWxhYmVsPXthcmlhTGFiZWx9IHVzZTpldmVudHNMaXN0ZW4+XG4gICAgeyNpZiBleHRlcmlvciA9PSAnY2xlYXInIHx8IGV4dGVyaW9yID09ICdsb2dpYy1vcicgfHwgZXh0ZXJpb3IgPT0gJ2xvZ2ljLWFuZCd9XG4gICAgICA8c2xvdCAvPlxuICAgIHs6ZWxzZX1cbiAgICAgIDxzbG90IG5hbWU9XCJidXR0b24taWNvblwiIC8+XG4gICAgICA8c3BhbiBjbGFzcz1cInNwZWN0cnVtLXtleHRlcmlvciA9PSAnYWN0aW9uJyA/ICdBY3Rpb25CdXR0b24nIDogJ0J1dHRvbid9LWxhYmVsXCI+XG4gICAgICAgIDxzbG90IC8+XG4gICAgICA8L3NwYW4+XG4gICAgey9pZn1cbiAgPC9idXR0b24+XG57L2lmfVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldFJlY3QoZWxlbWVudCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB0b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcDtcbiAgdmFyIGxlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50TGVmdDtcblxuICByZXR1cm4ge1xuICAgIHRvcDogcmVjdC50b3AgLSB0b3AsXG4gICAgYm90dG9tOiBNYXRoLmFicyhyZWN0LmJvdHRvbSAtIHRvcCksXG4gICAgbGVmdDogcmVjdC5sZWZ0IC0gbGVmdCxcbiAgICByaWdodDogTWF0aC5hYnMocmVjdC5yaWdodCAtIGxlZnQpLFxuICAgIHg6IHJlY3QueCxcbiAgICB5OiByZWN0LnksXG4gICAgd2lkdGg6IHJlY3Qud2lkdGggfHwgZWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0IHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5UaGVCb3hQb3NpdGlvbihwcmV2Tm9kZSwgdGFyZ2V0Tm9kZSkge1xuICBsZXQgcG9zV2lkdGggPSAwO1xuICBsZXQgcG9zSGVpZ2h0ID0gMDtcbiAgbGV0IGNoaWxkTm9kZXNMaXN0ID0gcHJldk5vZGUuY2hpbGROb2RlcztcbiAgbGV0IHRhcmdldEluZGV4ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCh0YXJnZXROb2RlLnBhcmVudE5vZGUuY2hpbGROb2RlcywgdGFyZ2V0Tm9kZSk7XG5cbiAgaWYgKHRhcmdldEluZGV4KSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRhcmdldEluZGV4OyBpbmRleCsrKSB7XG4gICAgICBpZiAoY2hpbGROb2Rlc0xpc3RbaW5kZXhdLnRhZ05hbWUpIHtcbiAgICAgICAgcG9zV2lkdGggPSBnZXRSZWN0KGNoaWxkTm9kZXNMaXN0W2luZGV4XSkud2lkdGggKyBwb3NXaWR0aDtcbiAgICAgICAgcG9zSGVpZ2h0ID0gZ2V0UmVjdChjaGlsZE5vZGVzTGlzdFtpbmRleF0pLmhlaWdodCArIHBvc0hlaWdodDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gW3Bvc1dpZHRoLnRvRml4ZWQoMiksIHBvc0hlaWdodC50b0ZpeGVkKDIpXTtcbn1cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBnZXRSZWN0IH0gZnJvbSBcIi4uL3V0aWxzL2VsZW1lbnQuanNcIjtcblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgcG9wb3ZlciBpcyBvcGVuXG4gICAqIEB0eXBlIHtib29sZWFufVtpc09wZW49ZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzT3BlbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSAgdmFyaWFudHMgb2YgcG9wdmVyXG4gICAqIEB0eXBlIHtcIm1lbnVcInxcImRpYWxvZ1wifVt2YXJpYW50cyA9IFwibWVudVwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCB2YXJpYW50cyA9IFwibWVudVwiO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSAgcG9zaXRpb24gbW9kZSBvZiBwb3B2ZXJcbiAgICogdmFyaWFudHMgPT4gXCJtZW51XCIgQHR5cGUgeyBcImF1dG9cInxcInRvcExlZnRcInxcInRvcFJpZ2h0XCJ8XCJib3R0b21MZWZ0XCJ8XCJib3R0b21SaWdodFwiXCJsZWZ0VG9wXCJ8XCJyaWdodFRvcFwifFwibGVmdEJvdHRvbVwifFwicmlnaHRCb3R0b21cIn0gWyBwb3B2ZXJQb3NpdGlvbiA9IFwiYXV0b1wiXVxuICAgKiB2YXJpYW50cyA9PiBcImRpYWxvZ1wiIEB0eXBlIHsgXCJjZW50ZXJMZWZ0XCJ8XCJjZW50ZXJSaWdodFwifFwiY2VudGVyVG9wXCJ8XCJjZW50ZXJCb3R0b21cIiB9XG4gICAqL1xuICBleHBvcnQgbGV0IHBvcHZlclBvc2l0aW9uID0gXCJhdXRvXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlICBxdWl0ZSBtb2RlIG9mIHBvcHZlclxuICAgKiBAdHlwZSB7Ym9vbGVhbn1baXNPcGVuPWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc1F1aWV0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlICB0aXRsZSBvZiBwb3B2ZXJcbiAgICogQHR5cGUge3N0cmluZ31bdGl0bGUgPSBcIlBvcG92ZXIgVGl0bGVcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgdGl0bGUgPSBcIlBvcG92ZXIgVGl0bGVcIjtcblxuICBsZXQgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJib3R0b21SaWdodFwiO1xuXG4gIGxldCBwb3BvdmVyO1xuICBsZXQgcG9wb3ZlclRpcDtcbiAgbGV0IG1lbnVCdXR0b247XG4gIGxldCBtZW51QnV0dG9uV2lkdGg7XG4gIGxldCBtZW51QnV0dG9uSGVpZ2h0O1xuICBsZXQgcG9wb3ZlcldpZHRoO1xuICBsZXQgcG9wb3ZlckhlaWdodDtcbiAgbGV0IHBvcG92ZXJUaXBXaWR0aDtcbiAgbGV0IHBvcG92ZXJUaXBIZWlnaHQ7XG5cbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgc2V0Q3NzVmFyKCk7XG4gIH0pO1xuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgYXV0b1BsYWNlKCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNldENzc1ZhcigpIHtcbiAgICBpZiAoIXBvcG92ZXIucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI3J1YnVzLUFjdGlvblNvdXJjZVwiKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtZW51QnV0dG9uID0gZ2V0UmVjdChwb3BvdmVyLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiNydWJ1cy1BY3Rpb25Tb3VyY2VcIikpO1xuICAgIG1lbnVCdXR0b25XaWR0aCA9IG1lbnVCdXR0b24gJiYgbWVudUJ1dHRvbi53aWR0aDtcbiAgICBtZW51QnV0dG9uSGVpZ2h0ID0gbWVudUJ1dHRvbiAmJiBtZW51QnV0dG9uLmhlaWdodDtcbiAgICBwb3BvdmVyV2lkdGggPSBwb3BvdmVyICYmIHBvcG92ZXIub2Zmc2V0V2lkdGg7XG4gICAgcG9wb3ZlckhlaWdodCA9IHBvcG92ZXIgJiYgcG9wb3Zlci5vZmZzZXRIZWlnaHQ7XG4gICAgcG9wb3ZlclRpcFdpZHRoID0gcG9wb3ZlclRpcCAmJiBwb3BvdmVyVGlwLm9mZnNldFdpZHRoO1xuICAgIHBvcG92ZXJUaXBIZWlnaHQgPSBwb3BvdmVyVGlwICYmIHBvcG92ZXJUaXAub2Zmc2V0SGVpZ2h0O1xuXG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGhcIiwgbWVudUJ1dHRvbldpZHRoICsgYHB4YCk7XG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0XCIsIG1lbnVCdXR0b25IZWlnaHQgKyBgcHhgKTtcbiAgICBwb3BvdmVyLnBhcmVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGhcIiwgcG9wb3ZlcldpZHRoICsgYHB4YCk7XG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodFwiLCBwb3BvdmVySGVpZ2h0ICsgYHB4YCk7XG4gICAgcG9wb3Zlci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC13aWR0aFwiLCBwb3BvdmVyVGlwV2lkdGggKyBgcHhgKTtcbiAgICBwb3BvdmVyLnBhcmVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodFwiLCBwb3BvdmVyVGlwSGVpZ2h0ICsgYHB4YCk7XG4gIH1cblxuICBmdW5jdGlvbiBhdXRvUGxhY2UoKSB7XG4gICAgaWYgKHZhcmlhbnRzID09IFwibWVudVwiKSB7XG4gICAgICBzd2l0Y2ggKHBvcHZlclBvc2l0aW9uID09IFwiYXV0b1wiKSB7XG4gICAgICAgIGNhc2UgbWVudUJ1dHRvbi54ID4gcG9wb3ZlcldpZHRoICYmXG4gICAgICAgICAgbWVudUJ1dHRvbi55ID4gcG9wb3ZlckhlaWdodCAmJlxuICAgICAgICAgIG1lbnVCdXR0b24ucmlnaHQgPCBwb3BvdmVyV2lkdGggJiZcbiAgICAgICAgICBtZW51QnV0dG9uLmJvdHRvbSA8IHBvcG92ZXJIZWlnaHQ6XG4gICAgICAgICAgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJ0b3BMZWZ0XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgbWVudUJ1dHRvbi54IDwgcG9wb3ZlcldpZHRoICYmXG4gICAgICAgICAgbWVudUJ1dHRvbi55ID4gcG9wb3ZlckhlaWdodCAmJlxuICAgICAgICAgIG1lbnVCdXR0b24ucmlnaHQgPiBwb3BvdmVyV2lkdGggJiZcbiAgICAgICAgICBtZW51QnV0dG9uLmJvdHRvbSA8IHBvcG92ZXJIZWlnaHQ6XG4gICAgICAgICAgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJ0b3BSaWdodFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIG1lbnVCdXR0b24ucmlnaHQgPCBwb3BvdmVyV2lkdGggJiYgbWVudUJ1dHRvbi54ID4gcG9wb3ZlcldpZHRoOlxuICAgICAgICAgIHBvcHZlclBvc2l0aW9uQXV0byA9IFwiYm90dG9tTGVmdFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHBvcHZlclBvc2l0aW9uQXV0byA9IFwiYm90dG9tUmlnaHRcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhcmlhbnRzID09IFwiZGlhbG9nXCIpIHtcbiAgICAgIHN3aXRjaCAocG9wdmVyUG9zaXRpb24gPT0gXCJhdXRvXCIpIHtcbiAgICAgICAgY2FzZSBtZW51QnV0dG9uLnggPiBwb3BvdmVyV2lkdGggJiYgbWVudUJ1dHRvbi5yaWdodCA8IHBvcG92ZXJXaWR0aDpcbiAgICAgICAgICBwb3B2ZXJQb3NpdGlvbkF1dG8gPSBcImNlbnRlckxlZnRcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBtZW51QnV0dG9uLnggPCBwb3BvdmVyV2lkdGggJiYgbWVudUJ1dHRvbi5yaWdodCA+IHBvcG92ZXJXaWR0aDpcbiAgICAgICAgICBwb3B2ZXJQb3NpdGlvbkF1dG8gPSBcImNlbnRlclJpZ2h0XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgbWVudUJ1dHRvbi54ID4gcG9wb3ZlcldpZHRoICYmXG4gICAgICAgICAgbWVudUJ1dHRvbi55ID4gcG9wb3ZlckhlaWdodCAmJlxuICAgICAgICAgIG1lbnVCdXR0b24ucmlnaHQgPiBwb3BvdmVyV2lkdGggJiZcbiAgICAgICAgICBtZW51QnV0dG9uLmJvdHRvbSA8IHBvcG92ZXJIZWlnaHQ6XG4gICAgICAgICAgcG9wdmVyUG9zaXRpb25BdXRvID0gXCJjZW50ZXJUb3BcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwb3B2ZXJQb3NpdGlvbkF1dG8gPSBcImNlbnRlckJvdHRvbVwiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuPC9zY3JpcHQ+XG5cbjxzdHlsZSBnbG9iYWw+XG4gIC5ydWJ1cy1Qb3BvdmVyLXJlZ2lzdGVyaW5nIHtcbiAgICBoZWlnaHQ6IHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSk7XG4gIH1cbiAgLnNwZWN0cnVtLVBvcG92ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYmFja2dyb3VuZC1jb2xvciwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWNvbG9yLWdyYXktNTApKTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYm9yZGVyLWNvbG9yLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItY29sb3ItZGFyaykpO1xuICAgIGJveC1zaGFkb3c6IDAgMXB4IDRweCB2YXIoLS1zcGVjdHJ1bS1wb3BvdmVyLXNoYWRvdy1jb2xvciwgdmFyKC0tc3BlY3RydW0tYWxpYXMtZHJvcHNoYWRvdy1jb2xvcikpO1xuICB9XG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIHtcbiAgICB6LWluZGV4OiAxMDA7XG4gIH1cbiAgLnNwZWN0cnVtLVBvcG92ZXIge1xuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcblxuICAgIG9wYWNpdHk6IDA7XG5cbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWFuaW1hdGlvbi1kdXJhdGlvbi0xMDAsIDEzMG1zKSBlYXNlLWluLW91dCxcbiAgICAgIG9wYWNpdHkgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWFuaW1hdGlvbi1kdXJhdGlvbi0xMDAsIDEzMG1zKSBlYXNlLWluLW91dCxcbiAgICAgIHZpc2liaWxpdHkgMG1zIGxpbmVhciB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtYW5pbWF0aW9uLWR1cmF0aW9uLTEwMCwgMTMwbXMpO1xuXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIH1cblxuICAuc3BlY3RydW0tUG9wb3Zlci5pcy1vcGVuIHtcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xuXG4gICAgb3BhY2l0eTogMTtcblxuICAgIHRyYW5zaXRpb24tZGVsYXk6IDBtcztcblxuICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICB9XG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIHtcbiAgICBkaXNwbGF5OiAtbXMtaW5saW5lLWZsZXhib3g7XG4gICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgLW1zLWZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuXG4gICAgbWluLXdpZHRoOiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNDAwKTtcbiAgICBtaW4taGVpZ2h0OiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNDAwKTtcblxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcblxuICAgIGJvcmRlci1zdHlsZTogc29saWQ7XG4gICAgYm9yZGVyLXdpZHRoOiB2YXIoLS1zcGVjdHJ1bS1wb3BvdmVyLWJvcmRlci1zaXplLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItc2l6ZS10aGluKSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1ib3JkZXItcmFkaXVzLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItcmFkaXVzLXJlZ3VsYXIpKTtcblxuICAgIG91dGxpbmU6IG5vbmU7XG4gIH1cblxuICAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHdpZHRoOiBjYWxjKHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgKyAxcHgpO1xuICAgIGhlaWdodDogY2FsYyhcbiAgICAgIHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgLyAyICtcbiAgICAgICAgdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1ib3JkZXItc2l6ZSwgdmFyKC0tc3BlY3RydW0tYWxpYXMtYm9yZGVyLXNpemUtdGhpbikpXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHdpZHRoOiBjYWxjKHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgKyAxcHgpO1xuICAgIGhlaWdodDogY2FsYyhcbiAgICAgIHZhcigtLXNwZWN0cnVtLXBvcG92ZXItdGlwLXdpZHRoLCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjUwKSkgLyAyICtcbiAgICAgICAgdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1ib3JkZXItc2l6ZSwgdmFyKC0tc3BlY3RydW0tYWxpYXMtYm9yZGVyLXNpemUtdGhpbikpXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tUG9wb3Zlci10aXA6OmFmdGVyIHtcbiAgICBjb250ZW50OiBcIlwiO1xuICAgIHdpZHRoOiB2YXIoLS1zcGVjdHJ1bS1wb3BvdmVyLXRpcC13aWR0aCwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTI1MCkpO1xuICAgIGhlaWdodDogdmFyKC0tc3BlY3RydW0tcG9wb3Zlci10aXAtd2lkdGgsIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0yNTApKTtcbiAgICBib3JkZXItd2lkdGg6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYm9yZGVyLXNpemUsIHZhcigtLXNwZWN0cnVtLWFsaWFzLWJvcmRlci1zaXplLXRoaW4pKTtcbiAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg0NWRlZyk7XG4gICAgdG9wOiAtMThweDtcbiAgfVxuXG4gIC5zcGVjdHJ1bS1Qb3BvdmVyLS1kaWFsb2cge1xuICAgIG1pbi13aWR0aDogMjcwcHg7XG4gICAgcGFkZGluZzogMzBweCAyOXB4O1xuICB9XG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIC5zcGVjdHJ1bS1EaWFsb2ctaGVhZGVyLFxuICAuc3BlY3RydW0tUG9wb3ZlciAuc3BlY3RydW0tRGlhbG9nLWZvb3RlcixcbiAgLnNwZWN0cnVtLVBvcG92ZXIgLnNwZWN0cnVtLURpYWxvZy13cmFwcGVyIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgfVxuXG4gIC5zcGVjdHJ1bS1Qb3BvdmVyIC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcDo6YWZ0ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYmFja2dyb3VuZC1jb2xvciwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWNvbG9yLWdyYXktNTApKTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXNwZWN0cnVtLXBvcG92ZXItYm9yZGVyLWNvbG9yLCB2YXIoLS1zcGVjdHJ1bS1hbGlhcy1ib3JkZXItY29sb3ItZGFyaykpO1xuICAgIGJveC1zaGFkb3c6IC0xcHggLTFweCA0cHggdmFyKC0tc3BlY3RydW0tcG9wb3Zlci1zaGFkb3ctY29sb3IsIHZhcigtLXNwZWN0cnVtLWFsaWFzLWRyb3BzaGFkb3ctY29sb3IpKTtcbiAgfVxuXG4gIC5ydWJ1cy1Qb3BvdmVyLS1ib3R0b21SaWdodCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgY2FsYygtMC44ICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkpKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tYm90dG9tUmlnaHQge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpKSxcbiAgICAgIGNhbGMoLTAuOCAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWJvdHRvbVJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1ib3R0b21SaWdodC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC0xICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSkpLCAwKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tYm90dG9tTGVmdCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpKSxcbiAgICAgIGNhbGMoLTAuOCAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWJvdHRvbUxlZnQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSksIDApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1ib3R0b21MZWZ0IHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSlcbiAgICAgICksXG4gICAgICBjYWxjKC0wLjggKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSlcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1ib3R0b21MZWZ0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTI1KVxuICAgICAgKSxcbiAgICAgIDBcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItLXRvcExlZnQge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMC44ICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tc3BlY3RydW0tZHJvcGRvd24tZmx5b3V0LW1lbnUtb2Zmc2V0LXksIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLXRvcExlZnQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAqIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tdG9wTGVmdCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpXG4gICAgICApLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXNwZWN0cnVtLWRyb3Bkb3duLWZseW91dC1tZW51LW9mZnNldC15LCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLXRvcExlZnQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpXG4gICAgICApLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgK1xuICAgICAgICAgICAgICB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMilcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS10b3BSaWdodCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICAwLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXNwZWN0cnVtLWRyb3Bkb3duLWZseW91dC1tZW51LW9mZnNldC15LCB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItLXRvcFJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgMCxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAqIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tdG9wUmlnaHQge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0wLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgK1xuICAgICAgICAgICAgICB2YXIoLS1zcGVjdHJ1bS1kcm9wZG93bi1mbHlvdXQtbWVudS1vZmZzZXQteSwgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tdG9wUmlnaHQuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSkpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgK1xuICAgICAgICAgICAgICB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMilcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1sZWZ0VG9wIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLWxlZnRUb3Age1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMC44ICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTUwKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWxlZnRUb3AuaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpLFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tbGVmdFRvcC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNTApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tcmlnaHRUb3Age1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygwLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLXJpZ2h0VG9wLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygxICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSlcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLXF1aWV0LS1yaWdodFRvcCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKDAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTUwKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLXJpZ2h0VG9wLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygxICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNTApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tcmlnaHRCb3R0b20ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygwLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tcmlnaHRCb3R0b20uaXMtb3BlbiB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKDEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tcmlnaHRCb3R0b20ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygwLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgLSB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTUwKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItcXVpZXQtLXJpZ2h0Qm90dG9tLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygxICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS01MClcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1sZWZ0Qm90dG9tIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tbGVmdEJvdHRvbSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0wLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS01MClcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1sZWZ0Qm90dG9tLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpKSxcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci1xdWlldC0tbGVmdEJvdHRvbS5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpIC0gdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSAtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS01MClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnJ1YnVzLVBvcG92ZXItLWNlbnRlckJvdHRvbSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgLyAyICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSAvIDIpLFxuICAgICAgY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkpXG4gICAgKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tY2VudGVyQm90dG9tLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpIC8gMiArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgLyAyKSxcbiAgICAgIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSlcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlckJvdHRvbS5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSAvIDIgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpIC8gMiksXG4gICAgICB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTI1KVxuICAgICk7XG4gIH1cbiAgLnNwZWN0cnVtLS1tZWRpdW0gLnJ1YnVzLVBvcG92ZXItLWNlbnRlckJvdHRvbSAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIHRvcDogY2FsYygtMC45NjEgKiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTMwKSk7XG4gIH1cbiAgLnNwZWN0cnVtLS1sYXJnZSAucnVidXMtUG9wb3Zlci0tY2VudGVyQm90dG9tIC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcCB7XG4gICAgdG9wOiBjYWxjKC0xICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEyNSkpO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJCb3R0b20gLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICBsZWZ0OiBjYWxjKCh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLXdpZHRoKSkgLyAyKTtcblxuICAgIHRyYW5zZm9ybTogcm90YXRlKDE4MGRlZyk7XG4gIH1cbiAgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclRvcCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0xICogdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgLyAyICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSAvIDIpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTAuOCAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkgKyAodmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSkpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLW1lZGl1bSAucnVidXMtUG9wb3Zlci0tY2VudGVyVG9wLmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItd2lkdGgpIC8gMiArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi13aWR0aCkgLyAyKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci10aXAtaGVpZ2h0KSArICh2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpKSlcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclRvcC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSAvIDIgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpIC8gMiksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMTc1KSlcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbWVkaXVtIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJUb3AgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICBib3R0b206IGNhbGMoLTAuOTYxICogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTEzMCkpO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclRvcCAuc3BlY3RydW0tUG9wb3Zlci10aXAge1xuICAgIGJvdHRvbTogY2FsYygtMSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMjUpKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tY2VudGVyVG9wIC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcCB7XG4gICAgbGVmdDogY2FsYygodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgLSB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC13aWR0aCkpIC8gMik7XG5cbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcbiAgfVxuICAucnVidXMtUG9wb3Zlci0tY2VudGVyTGVmdCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKC0wLjggKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMikpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAoKFxuICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodClcbiAgICAgICAgICAgICAgKSAvIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLW1lZGl1bSAucnVidXMtUG9wb3Zlci0tY2VudGVyTGVmdC5pcy1vcGVuIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShcbiAgICAgIGNhbGMoLTEgKiAodmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci13aWR0aCkgKyB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtNzUpICogMikpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAoKFxuICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodClcbiAgICAgICAgICAgICAgKSAvIDIpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLWxhcmdlIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJMZWZ0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYygtMSAqICh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0xMTUpICogMikpLFxuICAgICAgY2FsYyhcbiAgICAgICAgLTEgKiAoKFxuICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSArIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LWJ1dHRvbi1oZWlnaHQpICtcbiAgICAgICAgICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodClcbiAgICAgICAgICAgICAgKSAvIDEuOSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLnNwZWN0cnVtLS1tZWRpdW0gLnJ1YnVzLVBvcG92ZXItLWNlbnRlckxlZnQgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICB0b3A6IGNhbGMoKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkpIC8gMik7XG4gICAgcmlnaHQ6IGNhbGMoLTAuOTkgKiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjAwKSk7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoLTkwZGVnKTtcbiAgfVxuICAuc3BlY3RydW0tLWxhcmdlIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJMZWZ0IC5zcGVjdHJ1bS1Qb3BvdmVyLXRpcCB7XG4gICAgdG9wOiBjYWxjKCh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgLSB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC1oZWlnaHQpKSAvIDIpO1xuICAgIHJpZ2h0OiBjYWxjKC0wLjk3MiAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0yMDApKTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgtOTBkZWcpO1xuICB9XG4gIC5ydWJ1cy1Qb3BvdmVyLS1jZW50ZXJSaWdodCB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoXG4gICAgICBjYWxjKFxuICAgICAgICAwLjggKiB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTc1KSArXG4gICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci10aXAtd2lkdGgpIC8gM1xuICAgICAgKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKChcbiAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC1oZWlnaHQpXG4gICAgICAgICAgICAgICkgLyAyKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgLnNwZWN0cnVtLS1tZWRpdW0gLnJ1YnVzLVBvcG92ZXItLWNlbnRlclJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYyhcbiAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLXdpZHRoKSArIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS03NSkgK1xuICAgICAgICAgIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLXdpZHRoKSAvIDNcbiAgICAgICksXG4gICAgICBjYWxjKFxuICAgICAgICAtMSAqICgoXG4gICAgICAgICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci1oZWlnaHQpICsgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtYnV0dG9uLWhlaWdodCkgK1xuICAgICAgICAgICAgICAgICAgdmFyKC0tcnVidXMtYWN0aW9uLW1lbnUtcG9wb3Zlci10aXAtaGVpZ2h0KVxuICAgICAgICAgICAgICApIC8gMilcbiAgICAgIClcbiAgICApO1xuICB9XG4gIC5zcGVjdHJ1bS0tbGFyZ2UgLnJ1YnVzLVBvcG92ZXItLWNlbnRlclJpZ2h0LmlzLW9wZW4ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKFxuICAgICAgY2FsYyh2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24td2lkdGgpICsgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWRpbWVuc2lvbi1zaXplLTExNSkgKiAyKSxcbiAgICAgIGNhbGMoXG4gICAgICAgIC0xICogKChcbiAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLWhlaWdodCkgKyB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1idXR0b24taGVpZ2h0KSArXG4gICAgICAgICAgICAgICAgICB2YXIoLS1ydWJ1cy1hY3Rpb24tbWVudS1wb3BvdmVyLXRpcC1oZWlnaHQpXG4gICAgICAgICAgICAgICkgLyAxLjkpXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAuc3BlY3RydW0tLW1lZGl1bSAucnVidXMtUG9wb3Zlci0tY2VudGVyUmlnaHQgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICB0b3A6IGNhbGMoKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkpIC8gMik7XG4gICAgbGVmdDogY2FsYygtMC45OSAqIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1kaW1lbnNpb24tc2l6ZS0yMDApKTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg5MGRlZyk7XG4gIH1cbiAgLnNwZWN0cnVtLS1sYXJnZSAucnVidXMtUG9wb3Zlci0tY2VudGVyUmlnaHQgLnNwZWN0cnVtLVBvcG92ZXItdGlwIHtcbiAgICB0b3A6IGNhbGMoKHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItaGVpZ2h0KSAtIHZhcigtLXJ1YnVzLWFjdGlvbi1tZW51LXBvcG92ZXItdGlwLWhlaWdodCkpIC8gMik7XG4gICAgbGVmdDogY2FsYygtMC45NzIgKiB2YXIoLS1zcGVjdHJ1bS1nbG9iYWwtZGltZW5zaW9uLXNpemUtMjAwKSk7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoOTBkZWcpO1xuICB9XG48L3N0eWxlPlxuXG48ZGl2IGNsYXNzPVwicnVidXMtUG9wb3Zlci1yZWdpc3RlcmluZ1wiIC8+XG5cbjxkaXZcbiAgY2xhc3M9XCJzcGVjdHJ1bS1Qb3BvdmVyIHJ1YnVzLVBvcG92ZXItLXtwb3B2ZXJQb3NpdGlvbiA9PSAnYXV0bycgPyBwb3B2ZXJQb3NpdGlvbkF1dG8gOiBwb3B2ZXJQb3NpdGlvbn1cbiAgICB7aXNRdWlldCAmJiB2YXJpYW50cyA9PT0gJ21lbnUnID8gYHJ1YnVzLVBvcG92ZXItcXVpZXQtLSR7cG9wdmVyUG9zaXRpb24gPT0gJ2F1dG8nID8gcG9wdmVyUG9zaXRpb25BdXRvIDogcG9wdmVyUG9zaXRpb259YCA6IGBgfVxuICAgIHskJHJlc3RQcm9wcy5jbGFzc31cIlxuICBjbGFzczppcy1vcGVuPXtpc09wZW59XG4gIGNsYXNzOnNwZWN0cnVtLVBvcG92ZXItLWRpYWxvZz17dmFyaWFudHMgPT09ICdkaWFsb2cnfVxuICBiaW5kOnRoaXM9e3BvcG92ZXJ9PlxuICB7I2lmIHZhcmlhbnRzID09PSAnbWVudSd9XG4gICAgPHNsb3QgLz5cbiAgezplbHNlIGlmIHZhcmlhbnRzID09PSAnZGlhbG9nJ31cbiAgICA8ZGl2IGNsYXNzPVwic3BlY3RydW0tRGlhbG9nLWhlYWRlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNwZWN0cnVtLURpYWxvZy10aXRsZVwiPnt0aXRsZX08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic3BlY3RydW0tRGlhbG9nLWNvbnRlbnRcIj5cbiAgICAgIDxzbG90IC8+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNwZWN0cnVtLVBvcG92ZXItdGlwXCIgYmluZDp0aGlzPXtwb3BvdmVyVGlwfSAvPlxuICB7L2lmfVxuPC9kaXY+XG4iLCIvL1NhZmFyaSBEYXRlIGZ1bmN0aW9uIHBvbHlmaWxsXG4hKGZ1bmN0aW9uIChfRGF0ZSkge1xuICBmdW5jdGlvbiBzdGFuZGFyZGl6ZUFyZ3MoYXJncykge1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXJnc1swXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihfRGF0ZS5wYXJzZShhcmdzWzBdKSkpIHtcbiAgICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLy0vZywgXCIvXCIpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiAkRGF0ZSgpIHtcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mICREYXRlKSB7XG4gICAgICByZXR1cm4gbmV3IChGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5hcHBseShfRGF0ZSwgW251bGxdLmNvbmNhdChzdGFuZGFyZGl6ZUFyZ3MoYXJndW1lbnRzKSkpKSgpO1xuICAgIH1cbiAgICByZXR1cm4gX0RhdGUoKTtcbiAgfVxuICAkRGF0ZS5wcm90b3R5cGUgPSBfRGF0ZS5wcm90b3R5cGU7XG5cbiAgJERhdGUubm93ID0gX0RhdGUubm93O1xuICAkRGF0ZS5VVEMgPSBfRGF0ZS5VVEM7XG4gICREYXRlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfRGF0ZS5wYXJzZS5hcHBseShfRGF0ZSwgc3RhbmRhcmRpemVBcmdzKGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIERhdGUgPSAkRGF0ZTtcbn0pKERhdGUpO1xuIiwiJ3VzZSBzdHJpY3QnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRcImFsaWNlYmx1ZVwiOiBbMjQwLCAyNDgsIDI1NV0sXHJcblx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwgMjM1LCAyMTVdLFxyXG5cdFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiYXF1YW1hcmluZVwiOiBbMTI3LCAyNTUsIDIxMl0sXHJcblx0XCJhenVyZVwiOiBbMjQwLCAyNTUsIDI1NV0sXHJcblx0XCJiZWlnZVwiOiBbMjQ1LCAyNDUsIDIyMF0sXHJcblx0XCJiaXNxdWVcIjogWzI1NSwgMjI4LCAxOTZdLFxyXG5cdFwiYmxhY2tcIjogWzAsIDAsIDBdLFxyXG5cdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwgMjM1LCAyMDVdLFxyXG5cdFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcclxuXHRcImJsdWV2aW9sZXRcIjogWzEzOCwgNDMsIDIyNl0sXHJcblx0XCJicm93blwiOiBbMTY1LCA0MiwgNDJdLFxyXG5cdFwiYnVybHl3b29kXCI6IFsyMjIsIDE4NCwgMTM1XSxcclxuXHRcImNhZGV0Ymx1ZVwiOiBbOTUsIDE1OCwgMTYwXSxcclxuXHRcImNoYXJ0cmV1c2VcIjogWzEyNywgMjU1LCAwXSxcclxuXHRcImNob2NvbGF0ZVwiOiBbMjEwLCAxMDUsIDMwXSxcclxuXHRcImNvcmFsXCI6IFsyNTUsIDEyNywgODBdLFxyXG5cdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwgMTQ5LCAyMzddLFxyXG5cdFwiY29ybnNpbGtcIjogWzI1NSwgMjQ4LCAyMjBdLFxyXG5cdFwiY3JpbXNvblwiOiBbMjIwLCAyMCwgNjBdLFxyXG5cdFwiY3lhblwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiZGFya2JsdWVcIjogWzAsIDAsIDEzOV0sXHJcblx0XCJkYXJrY3lhblwiOiBbMCwgMTM5LCAxMzldLFxyXG5cdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LCAxMzQsIDExXSxcclxuXHRcImRhcmtncmF5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtncmVlblwiOiBbMCwgMTAwLCAwXSxcclxuXHRcImRhcmtncmV5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtraGFraVwiOiBbMTg5LCAxODMsIDEwN10sXHJcblx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LCAwLCAxMzldLFxyXG5cdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LCAxMDcsIDQ3XSxcclxuXHRcImRhcmtvcmFuZ2VcIjogWzI1NSwgMTQwLCAwXSxcclxuXHRcImRhcmtvcmNoaWRcIjogWzE1MywgNTAsIDIwNF0sXHJcblx0XCJkYXJrcmVkXCI6IFsxMzksIDAsIDBdLFxyXG5cdFwiZGFya3NhbG1vblwiOiBbMjMzLCAxNTAsIDEyMl0sXHJcblx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywgMTg4LCAxNDNdLFxyXG5cdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsIDYxLCAxMzldLFxyXG5cdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrc2xhdGVncmV5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmt0dXJxdW9pc2VcIjogWzAsIDIwNiwgMjA5XSxcclxuXHRcImRhcmt2aW9sZXRcIjogWzE0OCwgMCwgMjExXSxcclxuXHRcImRlZXBwaW5rXCI6IFsyNTUsIDIwLCAxNDddLFxyXG5cdFwiZGVlcHNreWJsdWVcIjogWzAsIDE5MSwgMjU1XSxcclxuXHRcImRpbWdyYXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZGltZ3JleVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkb2RnZXJibHVlXCI6IFszMCwgMTQ0LCAyNTVdLFxyXG5cdFwiZmlyZWJyaWNrXCI6IFsxNzgsIDM0LCAzNF0sXHJcblx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LCAyNTAsIDI0MF0sXHJcblx0XCJmb3Jlc3RncmVlblwiOiBbMzQsIDEzOSwgMzRdLFxyXG5cdFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwiZ2FpbnNib3JvXCI6IFsyMjAsIDIyMCwgMjIwXSxcclxuXHRcImdob3N0d2hpdGVcIjogWzI0OCwgMjQ4LCAyNTVdLFxyXG5cdFwiZ29sZFwiOiBbMjU1LCAyMTUsIDBdLFxyXG5cdFwiZ29sZGVucm9kXCI6IFsyMTgsIDE2NSwgMzJdLFxyXG5cdFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJncmVlblwiOiBbMCwgMTI4LCAwXSxcclxuXHRcImdyZWVueWVsbG93XCI6IFsxNzMsIDI1NSwgNDddLFxyXG5cdFwiZ3JleVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJob25leWRld1wiOiBbMjQwLCAyNTUsIDI0MF0sXHJcblx0XCJob3RwaW5rXCI6IFsyNTUsIDEwNSwgMTgwXSxcclxuXHRcImluZGlhbnJlZFwiOiBbMjA1LCA5MiwgOTJdLFxyXG5cdFwiaW5kaWdvXCI6IFs3NSwgMCwgMTMwXSxcclxuXHRcIml2b3J5XCI6IFsyNTUsIDI1NSwgMjQwXSxcclxuXHRcImtoYWtpXCI6IFsyNDAsIDIzMCwgMTQwXSxcclxuXHRcImxhdmVuZGVyXCI6IFsyMzAsIDIzMCwgMjUwXSxcclxuXHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwgMjQwLCAyNDVdLFxyXG5cdFwibGF3bmdyZWVuXCI6IFsxMjQsIDI1MiwgMF0sXHJcblx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwgMjUwLCAyMDVdLFxyXG5cdFwibGlnaHRibHVlXCI6IFsxNzMsIDIxNiwgMjMwXSxcclxuXHRcImxpZ2h0Y29yYWxcIjogWzI0MCwgMTI4LCAxMjhdLFxyXG5cdFwibGlnaHRjeWFuXCI6IFsyMjQsIDI1NSwgMjU1XSxcclxuXHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsIDI1MCwgMjEwXSxcclxuXHRcImxpZ2h0Z3JheVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodGdyZWVuXCI6IFsxNDQsIDIzOCwgMTQ0XSxcclxuXHRcImxpZ2h0Z3JleVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodHBpbmtcIjogWzI1NSwgMTgyLCAxOTNdLFxyXG5cdFwibGlnaHRzYWxtb25cIjogWzI1NSwgMTYwLCAxMjJdLFxyXG5cdFwibGlnaHRzZWFncmVlblwiOiBbMzIsIDE3OCwgMTcwXSxcclxuXHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDI1MF0sXHJcblx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LCAxOTYsIDIyMl0sXHJcblx0XCJsaWdodHllbGxvd1wiOiBbMjU1LCAyNTUsIDIyNF0sXHJcblx0XCJsaW1lXCI6IFswLCAyNTUsIDBdLFxyXG5cdFwibGltZWdyZWVuXCI6IFs1MCwgMjA1LCA1MF0sXHJcblx0XCJsaW5lblwiOiBbMjUwLCAyNDAsIDIzMF0sXHJcblx0XCJtYWdlbnRhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXHJcblx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsIDIwNSwgMTcwXSxcclxuXHRcIm1lZGl1bWJsdWVcIjogWzAsIDAsIDIwNV0sXHJcblx0XCJtZWRpdW1vcmNoaWRcIjogWzE4NiwgODUsIDIxMV0sXHJcblx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywgMTEyLCAyMTldLFxyXG5cdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLCAxNzksIDExM10sXHJcblx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywgMTA0LCAyMzhdLFxyXG5cdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsIDI1MCwgMTU0XSxcclxuXHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsIDIwOSwgMjA0XSxcclxuXHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LCAyMSwgMTMzXSxcclxuXHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsIDI1LCAxMTJdLFxyXG5cdFwibWludGNyZWFtXCI6IFsyNDUsIDI1NSwgMjUwXSxcclxuXHRcIm1pc3R5cm9zZVwiOiBbMjU1LCAyMjgsIDIyNV0sXHJcblx0XCJtb2NjYXNpblwiOiBbMjU1LCAyMjgsIDE4MV0sXHJcblx0XCJuYXZham93aGl0ZVwiOiBbMjU1LCAyMjIsIDE3M10sXHJcblx0XCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxyXG5cdFwib2xkbGFjZVwiOiBbMjUzLCAyNDUsIDIzMF0sXHJcblx0XCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxyXG5cdFwib2xpdmVkcmFiXCI6IFsxMDcsIDE0MiwgMzVdLFxyXG5cdFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXHJcblx0XCJvcmFuZ2VyZWRcIjogWzI1NSwgNjksIDBdLFxyXG5cdFwib3JjaGlkXCI6IFsyMTgsIDExMiwgMjE0XSxcclxuXHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwgMjMyLCAxNzBdLFxyXG5cdFwicGFsZWdyZWVuXCI6IFsxNTIsIDI1MSwgMTUyXSxcclxuXHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwgMjM4LCAyMzhdLFxyXG5cdFwicGFsZXZpb2xldHJlZFwiOiBbMjE5LCAxMTIsIDE0N10sXHJcblx0XCJwYXBheWF3aGlwXCI6IFsyNTUsIDIzOSwgMjEzXSxcclxuXHRcInBlYWNocHVmZlwiOiBbMjU1LCAyMTgsIDE4NV0sXHJcblx0XCJwZXJ1XCI6IFsyMDUsIDEzMywgNjNdLFxyXG5cdFwicGlua1wiOiBbMjU1LCAxOTIsIDIwM10sXHJcblx0XCJwbHVtXCI6IFsyMjEsIDE2MCwgMjIxXSxcclxuXHRcInBvd2RlcmJsdWVcIjogWzE3NiwgMjI0LCAyMzBdLFxyXG5cdFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXHJcblx0XCJyZWJlY2NhcHVycGxlXCI6IFsxMDIsIDUxLCAxNTNdLFxyXG5cdFwicmVkXCI6IFsyNTUsIDAsIDBdLFxyXG5cdFwicm9zeWJyb3duXCI6IFsxODgsIDE0MywgMTQzXSxcclxuXHRcInJveWFsYmx1ZVwiOiBbNjUsIDEwNSwgMjI1XSxcclxuXHRcInNhZGRsZWJyb3duXCI6IFsxMzksIDY5LCAxOV0sXHJcblx0XCJzYWxtb25cIjogWzI1MCwgMTI4LCAxMTRdLFxyXG5cdFwic2FuZHlicm93blwiOiBbMjQ0LCAxNjQsIDk2XSxcclxuXHRcInNlYWdyZWVuXCI6IFs0NiwgMTM5LCA4N10sXHJcblx0XCJzZWFzaGVsbFwiOiBbMjU1LCAyNDUsIDIzOF0sXHJcblx0XCJzaWVubmFcIjogWzE2MCwgODIsIDQ1XSxcclxuXHRcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXHJcblx0XCJza3libHVlXCI6IFsxMzUsIDIwNiwgMjM1XSxcclxuXHRcInNsYXRlYmx1ZVwiOiBbMTA2LCA5MCwgMjA1XSxcclxuXHRcInNsYXRlZ3JheVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbGF0ZWdyZXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic25vd1wiOiBbMjU1LCAyNTAsIDI1MF0sXHJcblx0XCJzcHJpbmdncmVlblwiOiBbMCwgMjU1LCAxMjddLFxyXG5cdFwic3RlZWxibHVlXCI6IFs3MCwgMTMwLCAxODBdLFxyXG5cdFwidGFuXCI6IFsyMTAsIDE4MCwgMTQwXSxcclxuXHRcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcclxuXHRcInRoaXN0bGVcIjogWzIxNiwgMTkxLCAyMTZdLFxyXG5cdFwidG9tYXRvXCI6IFsyNTUsIDk5LCA3MV0sXHJcblx0XCJ0dXJxdW9pc2VcIjogWzY0LCAyMjQsIDIwOF0sXHJcblx0XCJ2aW9sZXRcIjogWzIzOCwgMTMwLCAyMzhdLFxyXG5cdFwid2hlYXRcIjogWzI0NSwgMjIyLCAxNzldLFxyXG5cdFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxyXG5cdFwid2hpdGVzbW9rZVwiOiBbMjQ1LCAyNDUsIDI0NV0sXHJcblx0XCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXSxcclxuXHRcInllbGxvd2dyZWVuXCI6IFsxNTQsIDIwNSwgNTBdXHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBcnJheWlzaChvYmopIHtcblx0aWYgKCFvYmogfHwgdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gb2JqIGluc3RhbmNlb2YgQXJyYXkgfHwgQXJyYXkuaXNBcnJheShvYmopIHx8XG5cdFx0KG9iai5sZW5ndGggPj0gMCAmJiAob2JqLnNwbGljZSBpbnN0YW5jZW9mIEZ1bmN0aW9uIHx8XG5cdFx0XHQoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIChvYmoubGVuZ3RoIC0gMSkpICYmIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9PSAnU3RyaW5nJykpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0FycmF5aXNoID0gcmVxdWlyZSgnaXMtYXJyYXlpc2gnKTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbnZhciBzd2l6emxlID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzd2l6emxlKGFyZ3MpIHtcblx0dmFyIHJlc3VsdHMgPSBbXTtcblxuXHRmb3IgKHZhciBpID0gMCwgbGVuID0gYXJncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdHZhciBhcmcgPSBhcmdzW2ldO1xuXG5cdFx0aWYgKGlzQXJyYXlpc2goYXJnKSkge1xuXHRcdFx0Ly8gaHR0cDovL2pzcGVyZi5jb20vamF2YXNjcmlwdC1hcnJheS1jb25jYXQtdnMtcHVzaC85OFxuXHRcdFx0cmVzdWx0cyA9IGNvbmNhdC5jYWxsKHJlc3VsdHMsIHNsaWNlLmNhbGwoYXJnKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMucHVzaChhcmcpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRzO1xufTtcblxuc3dpenpsZS53cmFwID0gZnVuY3Rpb24gKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGZuKHN3aXp6bGUoYXJndW1lbnRzKSk7XG5cdH07XG59O1xuIiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjb2xvck5hbWVzID0gcmVxdWlyZSgnY29sb3ItbmFtZScpO1xudmFyIHN3aXp6bGUgPSByZXF1aXJlKCdzaW1wbGUtc3dpenpsZScpO1xuXG52YXIgcmV2ZXJzZU5hbWVzID0ge307XG5cbi8vIGNyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xuZm9yICh2YXIgbmFtZSBpbiBjb2xvck5hbWVzKSB7XG5cdGlmIChjb2xvck5hbWVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG5cdFx0cmV2ZXJzZU5hbWVzW2NvbG9yTmFtZXNbbmFtZV1dID0gbmFtZTtcblx0fVxufVxuXG52YXIgY3MgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblx0dG86IHt9LFxuXHRnZXQ6IHt9XG59O1xuXG5jcy5nZXQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdHZhciBwcmVmaXggPSBzdHJpbmcuc3Vic3RyaW5nKDAsIDMpLnRvTG93ZXJDYXNlKCk7XG5cdHZhciB2YWw7XG5cdHZhciBtb2RlbDtcblx0c3dpdGNoIChwcmVmaXgpIHtcblx0XHRjYXNlICdoc2wnOlxuXHRcdFx0dmFsID0gY3MuZ2V0LmhzbChzdHJpbmcpO1xuXHRcdFx0bW9kZWwgPSAnaHNsJztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2h3Yic6XG5cdFx0XHR2YWwgPSBjcy5nZXQuaHdiKHN0cmluZyk7XG5cdFx0XHRtb2RlbCA9ICdod2InO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHZhbCA9IGNzLmdldC5yZ2Ioc3RyaW5nKTtcblx0XHRcdG1vZGVsID0gJ3JnYic7XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdGlmICghdmFsKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge21vZGVsOiBtb2RlbCwgdmFsdWU6IHZhbH07XG59O1xuXG5jcy5nZXQucmdiID0gZnVuY3Rpb24gKHN0cmluZykge1xuXHRpZiAoIXN0cmluZykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0dmFyIGFiYnIgPSAvXiMoW2EtZjAtOV17Myw0fSkkL2k7XG5cdHZhciBoZXggPSAvXiMoW2EtZjAtOV17Nn0pKFthLWYwLTldezJ9KT8kL2k7XG5cdHZhciByZ2JhID0gL15yZ2JhP1xcKFxccyooWystXT9cXGQrKVxccyosXFxzKihbKy1dP1xcZCspXFxzKixcXHMqKFsrLV0/XFxkKylcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBwZXIgPSAvXnJnYmE/XFwoXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkkLztcblx0dmFyIGtleXdvcmQgPSAvKFxcRCspLztcblxuXHR2YXIgcmdiID0gWzAsIDAsIDAsIDFdO1xuXHR2YXIgbWF0Y2g7XG5cdHZhciBpO1xuXHR2YXIgaGV4QWxwaGE7XG5cblx0aWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGhleCkpIHtcblx0XHRoZXhBbHBoYSA9IG1hdGNoWzJdO1xuXHRcdG1hdGNoID0gbWF0Y2hbMV07XG5cblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHQvLyBodHRwczovL2pzcGVyZi5jb20vc2xpY2UtdnMtc3Vic3RyLXZzLXN1YnN0cmluZy1tZXRob2RzLWxvbmctc3RyaW5nLzE5XG5cdFx0XHR2YXIgaTIgPSBpICogMjtcblx0XHRcdHJnYltpXSA9IHBhcnNlSW50KG1hdGNoLnNsaWNlKGkyLCBpMiArIDIpLCAxNik7XG5cdFx0fVxuXG5cdFx0aWYgKGhleEFscGhhKSB7XG5cdFx0XHRyZ2JbM10gPSBwYXJzZUludChoZXhBbHBoYSwgMTYpIC8gMjU1O1xuXHRcdH1cblx0fSBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChhYmJyKSkge1xuXHRcdG1hdGNoID0gbWF0Y2hbMV07XG5cdFx0aGV4QWxwaGEgPSBtYXRjaFszXTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHRcdHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2ldICsgbWF0Y2hbaV0sIDE2KTtcblx0XHR9XG5cblx0XHRpZiAoaGV4QWxwaGEpIHtcblx0XHRcdHJnYlszXSA9IHBhcnNlSW50KGhleEFscGhhICsgaGV4QWxwaGEsIDE2KSAvIDI1NTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocmdiYSkpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpICsgMV0sIDApO1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaFs0XSkge1xuXHRcdFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQobWF0Y2hbaSArIDFdKSAqIDIuNTUpO1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaFs0XSkge1xuXHRcdFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGtleXdvcmQpKSB7XG5cdFx0aWYgKG1hdGNoWzFdID09PSAndHJhbnNwYXJlbnQnKSB7XG5cdFx0XHRyZXR1cm4gWzAsIDAsIDAsIDBdO1xuXHRcdH1cblxuXHRcdHJnYiA9IGNvbG9yTmFtZXNbbWF0Y2hbMV1dO1xuXG5cdFx0aWYgKCFyZ2IpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJnYlszXSA9IDE7XG5cblx0XHRyZXR1cm4gcmdiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Zm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdHJnYltpXSA9IGNsYW1wKHJnYltpXSwgMCwgMjU1KTtcblx0fVxuXHRyZ2JbM10gPSBjbGFtcChyZ2JbM10sIDAsIDEpO1xuXG5cdHJldHVybiByZ2I7XG59O1xuXG5jcy5nZXQuaHNsID0gZnVuY3Rpb24gKHN0cmluZykge1xuXHRpZiAoIXN0cmluZykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0dmFyIGhzbCA9IC9eaHNsYT9cXChcXHMqKFsrLV0/KD86XFxkKlxcLik/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChoc2wpO1xuXG5cdGlmIChtYXRjaCkge1xuXHRcdHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuXHRcdHZhciBoID0gKHBhcnNlRmxvYXQobWF0Y2hbMV0pICsgMzYwKSAlIDM2MDtcblx0XHR2YXIgcyA9IGNsYW1wKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApO1xuXHRcdHZhciBsID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCk7XG5cdFx0dmFyIGEgPSBjbGFtcChpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuXG5cdFx0cmV0dXJuIFtoLCBzLCBsLCBhXTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuY3MuZ2V0Lmh3YiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcblx0aWYgKCFzdHJpbmcpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHZhciBod2IgPSAvXmh3YlxcKFxccyooWystXT9cXGQqW1xcLl0/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChod2IpO1xuXG5cdGlmIChtYXRjaCkge1xuXHRcdHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuXHRcdHZhciBoID0gKChwYXJzZUZsb2F0KG1hdGNoWzFdKSAlIDM2MCkgKyAzNjApICUgMzYwO1xuXHRcdHZhciB3ID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCk7XG5cdFx0dmFyIGIgPSBjbGFtcChwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKTtcblx0XHR2YXIgYSA9IGNsYW1wKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XG5cdFx0cmV0dXJuIFtoLCB3LCBiLCBhXTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuY3MudG8uaGV4ID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHRyZXR1cm4gKFxuXHRcdCcjJyArXG5cdFx0aGV4RG91YmxlKHJnYmFbMF0pICtcblx0XHRoZXhEb3VibGUocmdiYVsxXSkgK1xuXHRcdGhleERvdWJsZShyZ2JhWzJdKSArXG5cdFx0KHJnYmFbM10gPCAxXG5cdFx0XHQ/IChoZXhEb3VibGUoTWF0aC5yb3VuZChyZ2JhWzNdICogMjU1KSkpXG5cdFx0XHQ6ICcnKVxuXHQpO1xufTtcblxuY3MudG8ucmdiID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHRyZXR1cm4gcmdiYS5sZW5ndGggPCA0IHx8IHJnYmFbM10gPT09IDFcblx0XHQ/ICdyZ2IoJyArIE1hdGgucm91bmQocmdiYVswXSkgKyAnLCAnICsgTWF0aC5yb3VuZChyZ2JhWzFdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMl0pICsgJyknXG5cdFx0OiAncmdiYSgnICsgTWF0aC5yb3VuZChyZ2JhWzBdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMV0pICsgJywgJyArIE1hdGgucm91bmQocmdiYVsyXSkgKyAnLCAnICsgcmdiYVszXSArICcpJztcbn07XG5cbmNzLnRvLnJnYi5wZXJjZW50ID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHR2YXIgciA9IE1hdGgucm91bmQocmdiYVswXSAvIDI1NSAqIDEwMCk7XG5cdHZhciBnID0gTWF0aC5yb3VuZChyZ2JhWzFdIC8gMjU1ICogMTAwKTtcblx0dmFyIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0gLyAyNTUgKiAxMDApO1xuXG5cdHJldHVybiByZ2JhLmxlbmd0aCA8IDQgfHwgcmdiYVszXSA9PT0gMVxuXHRcdD8gJ3JnYignICsgciArICclLCAnICsgZyArICclLCAnICsgYiArICclKSdcblx0XHQ6ICdyZ2JhKCcgKyByICsgJyUsICcgKyBnICsgJyUsICcgKyBiICsgJyUsICcgKyByZ2JhWzNdICsgJyknO1xufTtcblxuY3MudG8uaHNsID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgaHNsYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblx0cmV0dXJuIGhzbGEubGVuZ3RoIDwgNCB8fCBoc2xhWzNdID09PSAxXG5cdFx0PyAnaHNsKCcgKyBoc2xhWzBdICsgJywgJyArIGhzbGFbMV0gKyAnJSwgJyArIGhzbGFbMl0gKyAnJSknXG5cdFx0OiAnaHNsYSgnICsgaHNsYVswXSArICcsICcgKyBoc2xhWzFdICsgJyUsICcgKyBoc2xhWzJdICsgJyUsICcgKyBoc2xhWzNdICsgJyknO1xufTtcblxuLy8gaHdiIGlzIGEgYml0IGRpZmZlcmVudCB0aGFuIHJnYihhKSAmIGhzbChhKSBzaW5jZSB0aGVyZSBpcyBubyBhbHBoYSBzcGVjaWZpYyBzeW50YXhcbi8vIChod2IgaGF2ZSBhbHBoYSBvcHRpb25hbCAmIDEgaXMgZGVmYXVsdCB2YWx1ZSlcbmNzLnRvLmh3YiA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGh3YmEgPSBzd2l6emxlKGFyZ3VtZW50cyk7XG5cblx0dmFyIGEgPSAnJztcblx0aWYgKGh3YmEubGVuZ3RoID49IDQgJiYgaHdiYVszXSAhPT0gMSkge1xuXHRcdGEgPSAnLCAnICsgaHdiYVszXTtcblx0fVxuXG5cdHJldHVybiAnaHdiKCcgKyBod2JhWzBdICsgJywgJyArIGh3YmFbMV0gKyAnJSwgJyArIGh3YmFbMl0gKyAnJScgKyBhICsgJyknO1xufTtcblxuY3MudG8ua2V5d29yZCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0cmV0dXJuIHJldmVyc2VOYW1lc1tyZ2Iuc2xpY2UoMCwgMyldO1xufTtcblxuLy8gaGVscGVyc1xuZnVuY3Rpb24gY2xhbXAobnVtLCBtaW4sIG1heCkge1xuXHRyZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCBudW0pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiBoZXhEb3VibGUobnVtKSB7XG5cdHZhciBzdHIgPSBudW0udG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdHJldHVybiAoc3RyLmxlbmd0aCA8IDIpID8gJzAnICsgc3RyIDogc3RyO1xufVxuIiwiJ3VzZSBzdHJpY3QnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRcImFsaWNlYmx1ZVwiOiBbMjQwLCAyNDgsIDI1NV0sXHJcblx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwgMjM1LCAyMTVdLFxyXG5cdFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiYXF1YW1hcmluZVwiOiBbMTI3LCAyNTUsIDIxMl0sXHJcblx0XCJhenVyZVwiOiBbMjQwLCAyNTUsIDI1NV0sXHJcblx0XCJiZWlnZVwiOiBbMjQ1LCAyNDUsIDIyMF0sXHJcblx0XCJiaXNxdWVcIjogWzI1NSwgMjI4LCAxOTZdLFxyXG5cdFwiYmxhY2tcIjogWzAsIDAsIDBdLFxyXG5cdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwgMjM1LCAyMDVdLFxyXG5cdFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcclxuXHRcImJsdWV2aW9sZXRcIjogWzEzOCwgNDMsIDIyNl0sXHJcblx0XCJicm93blwiOiBbMTY1LCA0MiwgNDJdLFxyXG5cdFwiYnVybHl3b29kXCI6IFsyMjIsIDE4NCwgMTM1XSxcclxuXHRcImNhZGV0Ymx1ZVwiOiBbOTUsIDE1OCwgMTYwXSxcclxuXHRcImNoYXJ0cmV1c2VcIjogWzEyNywgMjU1LCAwXSxcclxuXHRcImNob2NvbGF0ZVwiOiBbMjEwLCAxMDUsIDMwXSxcclxuXHRcImNvcmFsXCI6IFsyNTUsIDEyNywgODBdLFxyXG5cdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwgMTQ5LCAyMzddLFxyXG5cdFwiY29ybnNpbGtcIjogWzI1NSwgMjQ4LCAyMjBdLFxyXG5cdFwiY3JpbXNvblwiOiBbMjIwLCAyMCwgNjBdLFxyXG5cdFwiY3lhblwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiZGFya2JsdWVcIjogWzAsIDAsIDEzOV0sXHJcblx0XCJkYXJrY3lhblwiOiBbMCwgMTM5LCAxMzldLFxyXG5cdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LCAxMzQsIDExXSxcclxuXHRcImRhcmtncmF5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtncmVlblwiOiBbMCwgMTAwLCAwXSxcclxuXHRcImRhcmtncmV5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtraGFraVwiOiBbMTg5LCAxODMsIDEwN10sXHJcblx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LCAwLCAxMzldLFxyXG5cdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LCAxMDcsIDQ3XSxcclxuXHRcImRhcmtvcmFuZ2VcIjogWzI1NSwgMTQwLCAwXSxcclxuXHRcImRhcmtvcmNoaWRcIjogWzE1MywgNTAsIDIwNF0sXHJcblx0XCJkYXJrcmVkXCI6IFsxMzksIDAsIDBdLFxyXG5cdFwiZGFya3NhbG1vblwiOiBbMjMzLCAxNTAsIDEyMl0sXHJcblx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywgMTg4LCAxNDNdLFxyXG5cdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsIDYxLCAxMzldLFxyXG5cdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrc2xhdGVncmV5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmt0dXJxdW9pc2VcIjogWzAsIDIwNiwgMjA5XSxcclxuXHRcImRhcmt2aW9sZXRcIjogWzE0OCwgMCwgMjExXSxcclxuXHRcImRlZXBwaW5rXCI6IFsyNTUsIDIwLCAxNDddLFxyXG5cdFwiZGVlcHNreWJsdWVcIjogWzAsIDE5MSwgMjU1XSxcclxuXHRcImRpbWdyYXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZGltZ3JleVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkb2RnZXJibHVlXCI6IFszMCwgMTQ0LCAyNTVdLFxyXG5cdFwiZmlyZWJyaWNrXCI6IFsxNzgsIDM0LCAzNF0sXHJcblx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LCAyNTAsIDI0MF0sXHJcblx0XCJmb3Jlc3RncmVlblwiOiBbMzQsIDEzOSwgMzRdLFxyXG5cdFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwiZ2FpbnNib3JvXCI6IFsyMjAsIDIyMCwgMjIwXSxcclxuXHRcImdob3N0d2hpdGVcIjogWzI0OCwgMjQ4LCAyNTVdLFxyXG5cdFwiZ29sZFwiOiBbMjU1LCAyMTUsIDBdLFxyXG5cdFwiZ29sZGVucm9kXCI6IFsyMTgsIDE2NSwgMzJdLFxyXG5cdFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJncmVlblwiOiBbMCwgMTI4LCAwXSxcclxuXHRcImdyZWVueWVsbG93XCI6IFsxNzMsIDI1NSwgNDddLFxyXG5cdFwiZ3JleVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJob25leWRld1wiOiBbMjQwLCAyNTUsIDI0MF0sXHJcblx0XCJob3RwaW5rXCI6IFsyNTUsIDEwNSwgMTgwXSxcclxuXHRcImluZGlhbnJlZFwiOiBbMjA1LCA5MiwgOTJdLFxyXG5cdFwiaW5kaWdvXCI6IFs3NSwgMCwgMTMwXSxcclxuXHRcIml2b3J5XCI6IFsyNTUsIDI1NSwgMjQwXSxcclxuXHRcImtoYWtpXCI6IFsyNDAsIDIzMCwgMTQwXSxcclxuXHRcImxhdmVuZGVyXCI6IFsyMzAsIDIzMCwgMjUwXSxcclxuXHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwgMjQwLCAyNDVdLFxyXG5cdFwibGF3bmdyZWVuXCI6IFsxMjQsIDI1MiwgMF0sXHJcblx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwgMjUwLCAyMDVdLFxyXG5cdFwibGlnaHRibHVlXCI6IFsxNzMsIDIxNiwgMjMwXSxcclxuXHRcImxpZ2h0Y29yYWxcIjogWzI0MCwgMTI4LCAxMjhdLFxyXG5cdFwibGlnaHRjeWFuXCI6IFsyMjQsIDI1NSwgMjU1XSxcclxuXHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsIDI1MCwgMjEwXSxcclxuXHRcImxpZ2h0Z3JheVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodGdyZWVuXCI6IFsxNDQsIDIzOCwgMTQ0XSxcclxuXHRcImxpZ2h0Z3JleVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodHBpbmtcIjogWzI1NSwgMTgyLCAxOTNdLFxyXG5cdFwibGlnaHRzYWxtb25cIjogWzI1NSwgMTYwLCAxMjJdLFxyXG5cdFwibGlnaHRzZWFncmVlblwiOiBbMzIsIDE3OCwgMTcwXSxcclxuXHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDI1MF0sXHJcblx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LCAxOTYsIDIyMl0sXHJcblx0XCJsaWdodHllbGxvd1wiOiBbMjU1LCAyNTUsIDIyNF0sXHJcblx0XCJsaW1lXCI6IFswLCAyNTUsIDBdLFxyXG5cdFwibGltZWdyZWVuXCI6IFs1MCwgMjA1LCA1MF0sXHJcblx0XCJsaW5lblwiOiBbMjUwLCAyNDAsIDIzMF0sXHJcblx0XCJtYWdlbnRhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXHJcblx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsIDIwNSwgMTcwXSxcclxuXHRcIm1lZGl1bWJsdWVcIjogWzAsIDAsIDIwNV0sXHJcblx0XCJtZWRpdW1vcmNoaWRcIjogWzE4NiwgODUsIDIxMV0sXHJcblx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywgMTEyLCAyMTldLFxyXG5cdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLCAxNzksIDExM10sXHJcblx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywgMTA0LCAyMzhdLFxyXG5cdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsIDI1MCwgMTU0XSxcclxuXHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsIDIwOSwgMjA0XSxcclxuXHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LCAyMSwgMTMzXSxcclxuXHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsIDI1LCAxMTJdLFxyXG5cdFwibWludGNyZWFtXCI6IFsyNDUsIDI1NSwgMjUwXSxcclxuXHRcIm1pc3R5cm9zZVwiOiBbMjU1LCAyMjgsIDIyNV0sXHJcblx0XCJtb2NjYXNpblwiOiBbMjU1LCAyMjgsIDE4MV0sXHJcblx0XCJuYXZham93aGl0ZVwiOiBbMjU1LCAyMjIsIDE3M10sXHJcblx0XCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxyXG5cdFwib2xkbGFjZVwiOiBbMjUzLCAyNDUsIDIzMF0sXHJcblx0XCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxyXG5cdFwib2xpdmVkcmFiXCI6IFsxMDcsIDE0MiwgMzVdLFxyXG5cdFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXHJcblx0XCJvcmFuZ2VyZWRcIjogWzI1NSwgNjksIDBdLFxyXG5cdFwib3JjaGlkXCI6IFsyMTgsIDExMiwgMjE0XSxcclxuXHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwgMjMyLCAxNzBdLFxyXG5cdFwicGFsZWdyZWVuXCI6IFsxNTIsIDI1MSwgMTUyXSxcclxuXHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwgMjM4LCAyMzhdLFxyXG5cdFwicGFsZXZpb2xldHJlZFwiOiBbMjE5LCAxMTIsIDE0N10sXHJcblx0XCJwYXBheWF3aGlwXCI6IFsyNTUsIDIzOSwgMjEzXSxcclxuXHRcInBlYWNocHVmZlwiOiBbMjU1LCAyMTgsIDE4NV0sXHJcblx0XCJwZXJ1XCI6IFsyMDUsIDEzMywgNjNdLFxyXG5cdFwicGlua1wiOiBbMjU1LCAxOTIsIDIwM10sXHJcblx0XCJwbHVtXCI6IFsyMjEsIDE2MCwgMjIxXSxcclxuXHRcInBvd2RlcmJsdWVcIjogWzE3NiwgMjI0LCAyMzBdLFxyXG5cdFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXHJcblx0XCJyZWJlY2NhcHVycGxlXCI6IFsxMDIsIDUxLCAxNTNdLFxyXG5cdFwicmVkXCI6IFsyNTUsIDAsIDBdLFxyXG5cdFwicm9zeWJyb3duXCI6IFsxODgsIDE0MywgMTQzXSxcclxuXHRcInJveWFsYmx1ZVwiOiBbNjUsIDEwNSwgMjI1XSxcclxuXHRcInNhZGRsZWJyb3duXCI6IFsxMzksIDY5LCAxOV0sXHJcblx0XCJzYWxtb25cIjogWzI1MCwgMTI4LCAxMTRdLFxyXG5cdFwic2FuZHlicm93blwiOiBbMjQ0LCAxNjQsIDk2XSxcclxuXHRcInNlYWdyZWVuXCI6IFs0NiwgMTM5LCA4N10sXHJcblx0XCJzZWFzaGVsbFwiOiBbMjU1LCAyNDUsIDIzOF0sXHJcblx0XCJzaWVubmFcIjogWzE2MCwgODIsIDQ1XSxcclxuXHRcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXHJcblx0XCJza3libHVlXCI6IFsxMzUsIDIwNiwgMjM1XSxcclxuXHRcInNsYXRlYmx1ZVwiOiBbMTA2LCA5MCwgMjA1XSxcclxuXHRcInNsYXRlZ3JheVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbGF0ZWdyZXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic25vd1wiOiBbMjU1LCAyNTAsIDI1MF0sXHJcblx0XCJzcHJpbmdncmVlblwiOiBbMCwgMjU1LCAxMjddLFxyXG5cdFwic3RlZWxibHVlXCI6IFs3MCwgMTMwLCAxODBdLFxyXG5cdFwidGFuXCI6IFsyMTAsIDE4MCwgMTQwXSxcclxuXHRcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcclxuXHRcInRoaXN0bGVcIjogWzIxNiwgMTkxLCAyMTZdLFxyXG5cdFwidG9tYXRvXCI6IFsyNTUsIDk5LCA3MV0sXHJcblx0XCJ0dXJxdW9pc2VcIjogWzY0LCAyMjQsIDIwOF0sXHJcblx0XCJ2aW9sZXRcIjogWzIzOCwgMTMwLCAyMzhdLFxyXG5cdFwid2hlYXRcIjogWzI0NSwgMjIyLCAxNzldLFxyXG5cdFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxyXG5cdFwid2hpdGVzbW9rZVwiOiBbMjQ1LCAyNDUsIDI0NV0sXHJcblx0XCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXSxcclxuXHRcInllbGxvd2dyZWVuXCI6IFsxNTQsIDIwNSwgNTBdXHJcbn07XHJcbiIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY3NzS2V5d29yZHMgPSByZXF1aXJlKCdjb2xvci1uYW1lJyk7XG5cbi8vIE5PVEU6IGNvbnZlcnNpb25zIHNob3VsZCBvbmx5IHJldHVybiBwcmltaXRpdmUgdmFsdWVzIChpLmUuIGFycmF5cywgb3Jcbi8vICAgICAgIHZhbHVlcyB0aGF0IGdpdmUgY29ycmVjdCBgdHlwZW9mYCByZXN1bHRzKS5cbi8vICAgICAgIGRvIG5vdCB1c2UgYm94IHZhbHVlcyB0eXBlcyAoaS5lLiBOdW1iZXIoKSwgU3RyaW5nKCksIGV0Yy4pXG5cbnZhciByZXZlcnNlS2V5d29yZHMgPSB7fTtcbmZvciAodmFyIGtleSBpbiBjc3NLZXl3b3Jkcykge1xuXHRpZiAoY3NzS2V5d29yZHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdHJldmVyc2VLZXl3b3Jkc1tjc3NLZXl3b3Jkc1trZXldXSA9IGtleTtcblx0fVxufVxuXG52YXIgY29udmVydCA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHRyZ2I6IHtjaGFubmVsczogMywgbGFiZWxzOiAncmdiJ30sXG5cdGhzbDoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdoc2wnfSxcblx0aHN2OiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2hzdid9LFxuXHRod2I6IHtjaGFubmVsczogMywgbGFiZWxzOiAnaHdiJ30sXG5cdGNteWs6IHtjaGFubmVsczogNCwgbGFiZWxzOiAnY215ayd9LFxuXHR4eXo6IHtjaGFubmVsczogMywgbGFiZWxzOiAneHl6J30sXG5cdGxhYjoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdsYWInfSxcblx0bGNoOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2xjaCd9LFxuXHRoZXg6IHtjaGFubmVsczogMSwgbGFiZWxzOiBbJ2hleCddfSxcblx0a2V5d29yZDoge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsna2V5d29yZCddfSxcblx0YW5zaTE2OiB7Y2hhbm5lbHM6IDEsIGxhYmVsczogWydhbnNpMTYnXX0sXG5cdGFuc2kyNTY6IHtjaGFubmVsczogMSwgbGFiZWxzOiBbJ2Fuc2kyNTYnXX0sXG5cdGhjZzoge2NoYW5uZWxzOiAzLCBsYWJlbHM6IFsnaCcsICdjJywgJ2cnXX0sXG5cdGFwcGxlOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogWydyMTYnLCAnZzE2JywgJ2IxNiddfSxcblx0Z3JheToge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsnZ3JheSddfVxufTtcblxuLy8gaGlkZSAuY2hhbm5lbHMgYW5kIC5sYWJlbHMgcHJvcGVydGllc1xuZm9yICh2YXIgbW9kZWwgaW4gY29udmVydCkge1xuXHRpZiAoY29udmVydC5oYXNPd25Qcm9wZXJ0eShtb2RlbCkpIHtcblx0XHRpZiAoISgnY2hhbm5lbHMnIGluIGNvbnZlcnRbbW9kZWxdKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGNoYW5uZWxzIHByb3BlcnR5OiAnICsgbW9kZWwpO1xuXHRcdH1cblxuXHRcdGlmICghKCdsYWJlbHMnIGluIGNvbnZlcnRbbW9kZWxdKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGNoYW5uZWwgbGFiZWxzIHByb3BlcnR5OiAnICsgbW9kZWwpO1xuXHRcdH1cblxuXHRcdGlmIChjb252ZXJ0W21vZGVsXS5sYWJlbHMubGVuZ3RoICE9PSBjb252ZXJ0W21vZGVsXS5jaGFubmVscykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdjaGFubmVsIGFuZCBsYWJlbCBjb3VudHMgbWlzbWF0Y2g6ICcgKyBtb2RlbCk7XG5cdFx0fVxuXG5cdFx0dmFyIGNoYW5uZWxzID0gY29udmVydFttb2RlbF0uY2hhbm5lbHM7XG5cdFx0dmFyIGxhYmVscyA9IGNvbnZlcnRbbW9kZWxdLmxhYmVscztcblx0XHRkZWxldGUgY29udmVydFttb2RlbF0uY2hhbm5lbHM7XG5cdFx0ZGVsZXRlIGNvbnZlcnRbbW9kZWxdLmxhYmVscztcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udmVydFttb2RlbF0sICdjaGFubmVscycsIHt2YWx1ZTogY2hhbm5lbHN9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udmVydFttb2RlbF0sICdsYWJlbHMnLCB7dmFsdWU6IGxhYmVsc30pO1xuXHR9XG59XG5cbmNvbnZlcnQucmdiLmhzbCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuXHR2YXIgbWF4ID0gTWF0aC5tYXgociwgZywgYik7XG5cdHZhciBkZWx0YSA9IG1heCAtIG1pbjtcblx0dmFyIGg7XG5cdHZhciBzO1xuXHR2YXIgbDtcblxuXHRpZiAobWF4ID09PSBtaW4pIHtcblx0XHRoID0gMDtcblx0fSBlbHNlIGlmIChyID09PSBtYXgpIHtcblx0XHRoID0gKGcgLSBiKSAvIGRlbHRhO1xuXHR9IGVsc2UgaWYgKGcgPT09IG1heCkge1xuXHRcdGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuXHR9IGVsc2UgaWYgKGIgPT09IG1heCkge1xuXHRcdGggPSA0ICsgKHIgLSBnKSAvIGRlbHRhO1xuXHR9XG5cblx0aCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuXHRpZiAoaCA8IDApIHtcblx0XHRoICs9IDM2MDtcblx0fVxuXG5cdGwgPSAobWluICsgbWF4KSAvIDI7XG5cblx0aWYgKG1heCA9PT0gbWluKSB7XG5cdFx0cyA9IDA7XG5cdH0gZWxzZSBpZiAobCA8PSAwLjUpIHtcblx0XHRzID0gZGVsdGEgLyAobWF4ICsgbWluKTtcblx0fSBlbHNlIHtcblx0XHRzID0gZGVsdGEgLyAoMiAtIG1heCAtIG1pbik7XG5cdH1cblxuXHRyZXR1cm4gW2gsIHMgKiAxMDAsIGwgKiAxMDBdO1xufTtcblxuY29udmVydC5yZ2IuaHN2ID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgcmRpZjtcblx0dmFyIGdkaWY7XG5cdHZhciBiZGlmO1xuXHR2YXIgaDtcblx0dmFyIHM7XG5cblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIHYgPSBNYXRoLm1heChyLCBnLCBiKTtcblx0dmFyIGRpZmYgPSB2IC0gTWF0aC5taW4ociwgZywgYik7XG5cdHZhciBkaWZmYyA9IGZ1bmN0aW9uIChjKSB7XG5cdFx0cmV0dXJuICh2IC0gYykgLyA2IC8gZGlmZiArIDEgLyAyO1xuXHR9O1xuXG5cdGlmIChkaWZmID09PSAwKSB7XG5cdFx0aCA9IHMgPSAwO1xuXHR9IGVsc2Uge1xuXHRcdHMgPSBkaWZmIC8gdjtcblx0XHRyZGlmID0gZGlmZmMocik7XG5cdFx0Z2RpZiA9IGRpZmZjKGcpO1xuXHRcdGJkaWYgPSBkaWZmYyhiKTtcblxuXHRcdGlmIChyID09PSB2KSB7XG5cdFx0XHRoID0gYmRpZiAtIGdkaWY7XG5cdFx0fSBlbHNlIGlmIChnID09PSB2KSB7XG5cdFx0XHRoID0gKDEgLyAzKSArIHJkaWYgLSBiZGlmO1xuXHRcdH0gZWxzZSBpZiAoYiA9PT0gdikge1xuXHRcdFx0aCA9ICgyIC8gMykgKyBnZGlmIC0gcmRpZjtcblx0XHR9XG5cdFx0aWYgKGggPCAwKSB7XG5cdFx0XHRoICs9IDE7XG5cdFx0fSBlbHNlIGlmIChoID4gMSkge1xuXHRcdFx0aCAtPSAxO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBbXG5cdFx0aCAqIDM2MCxcblx0XHRzICogMTAwLFxuXHRcdHYgKiAxMDBcblx0XTtcbn07XG5cbmNvbnZlcnQucmdiLmh3YiA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF07XG5cdHZhciBnID0gcmdiWzFdO1xuXHR2YXIgYiA9IHJnYlsyXTtcblx0dmFyIGggPSBjb252ZXJ0LnJnYi5oc2wocmdiKVswXTtcblx0dmFyIHcgPSAxIC8gMjU1ICogTWF0aC5taW4ociwgTWF0aC5taW4oZywgYikpO1xuXG5cdGIgPSAxIC0gMSAvIDI1NSAqIE1hdGgubWF4KHIsIE1hdGgubWF4KGcsIGIpKTtcblxuXHRyZXR1cm4gW2gsIHcgKiAxMDAsIGIgKiAxMDBdO1xufTtcblxuY29udmVydC5yZ2IuY215ayA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIGM7XG5cdHZhciBtO1xuXHR2YXIgeTtcblx0dmFyIGs7XG5cblx0ayA9IE1hdGgubWluKDEgLSByLCAxIC0gZywgMSAtIGIpO1xuXHRjID0gKDEgLSByIC0gaykgLyAoMSAtIGspIHx8IDA7XG5cdG0gPSAoMSAtIGcgLSBrKSAvICgxIC0gaykgfHwgMDtcblx0eSA9ICgxIC0gYiAtIGspIC8gKDEgLSBrKSB8fCAwO1xuXG5cdHJldHVybiBbYyAqIDEwMCwgbSAqIDEwMCwgeSAqIDEwMCwgayAqIDEwMF07XG59O1xuXG4vKipcbiAqIFNlZSBodHRwczovL2VuLm0ud2lraXBlZGlhLm9yZy93aWtpL0V1Y2xpZGVhbl9kaXN0YW5jZSNTcXVhcmVkX0V1Y2xpZGVhbl9kaXN0YW5jZVxuICogKi9cbmZ1bmN0aW9uIGNvbXBhcmF0aXZlRGlzdGFuY2UoeCwgeSkge1xuXHRyZXR1cm4gKFxuXHRcdE1hdGgucG93KHhbMF0gLSB5WzBdLCAyKSArXG5cdFx0TWF0aC5wb3coeFsxXSAtIHlbMV0sIDIpICtcblx0XHRNYXRoLnBvdyh4WzJdIC0geVsyXSwgMilcblx0KTtcbn1cblxuY29udmVydC5yZ2Iua2V5d29yZCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHJldmVyc2VkID0gcmV2ZXJzZUtleXdvcmRzW3JnYl07XG5cdGlmIChyZXZlcnNlZCkge1xuXHRcdHJldHVybiByZXZlcnNlZDtcblx0fVxuXG5cdHZhciBjdXJyZW50Q2xvc2VzdERpc3RhbmNlID0gSW5maW5pdHk7XG5cdHZhciBjdXJyZW50Q2xvc2VzdEtleXdvcmQ7XG5cblx0Zm9yICh2YXIga2V5d29yZCBpbiBjc3NLZXl3b3Jkcykge1xuXHRcdGlmIChjc3NLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eShrZXl3b3JkKSkge1xuXHRcdFx0dmFyIHZhbHVlID0gY3NzS2V5d29yZHNba2V5d29yZF07XG5cblx0XHRcdC8vIENvbXB1dGUgY29tcGFyYXRpdmUgZGlzdGFuY2Vcblx0XHRcdHZhciBkaXN0YW5jZSA9IGNvbXBhcmF0aXZlRGlzdGFuY2UocmdiLCB2YWx1ZSk7XG5cblx0XHRcdC8vIENoZWNrIGlmIGl0cyBsZXNzLCBpZiBzbyBzZXQgYXMgY2xvc2VzdFxuXHRcdFx0aWYgKGRpc3RhbmNlIDwgY3VycmVudENsb3Nlc3REaXN0YW5jZSkge1xuXHRcdFx0XHRjdXJyZW50Q2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdGN1cnJlbnRDbG9zZXN0S2V5d29yZCA9IGtleXdvcmQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGN1cnJlbnRDbG9zZXN0S2V5d29yZDtcbn07XG5cbmNvbnZlcnQua2V5d29yZC5yZ2IgPSBmdW5jdGlvbiAoa2V5d29yZCkge1xuXHRyZXR1cm4gY3NzS2V5d29yZHNba2V5d29yZF07XG59O1xuXG5jb252ZXJ0LnJnYi54eXogPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciByID0gcmdiWzBdIC8gMjU1O1xuXHR2YXIgZyA9IHJnYlsxXSAvIDI1NTtcblx0dmFyIGIgPSByZ2JbMl0gLyAyNTU7XG5cblx0Ly8gYXNzdW1lIHNSR0Jcblx0ciA9IHIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChyICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKHIgLyAxMi45Mik7XG5cdGcgPSBnID4gMC4wNDA0NSA/IE1hdGgucG93KCgoZyArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChnIC8gMTIuOTIpO1xuXHRiID0gYiA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoYiAvIDEyLjkyKTtcblxuXHR2YXIgeCA9IChyICogMC40MTI0KSArIChnICogMC4zNTc2KSArIChiICogMC4xODA1KTtcblx0dmFyIHkgPSAociAqIDAuMjEyNikgKyAoZyAqIDAuNzE1MikgKyAoYiAqIDAuMDcyMik7XG5cdHZhciB6ID0gKHIgKiAwLjAxOTMpICsgKGcgKiAwLjExOTIpICsgKGIgKiAwLjk1MDUpO1xuXG5cdHJldHVybiBbeCAqIDEwMCwgeSAqIDEwMCwgeiAqIDEwMF07XG59O1xuXG5jb252ZXJ0LnJnYi5sYWIgPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciB4eXogPSBjb252ZXJ0LnJnYi54eXoocmdiKTtcblx0dmFyIHggPSB4eXpbMF07XG5cdHZhciB5ID0geHl6WzFdO1xuXHR2YXIgeiA9IHh5elsyXTtcblx0dmFyIGw7XG5cdHZhciBhO1xuXHR2YXIgYjtcblxuXHR4IC89IDk1LjA0Nztcblx0eSAvPSAxMDA7XG5cdHogLz0gMTA4Ljg4MztcblxuXHR4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMSAvIDMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuXHR5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMSAvIDMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuXHR6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMSAvIDMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG5cdGwgPSAoMTE2ICogeSkgLSAxNjtcblx0YSA9IDUwMCAqICh4IC0geSk7XG5cdGIgPSAyMDAgKiAoeSAtIHopO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59O1xuXG5jb252ZXJ0LmhzbC5yZ2IgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBoID0gaHNsWzBdIC8gMzYwO1xuXHR2YXIgcyA9IGhzbFsxXSAvIDEwMDtcblx0dmFyIGwgPSBoc2xbMl0gLyAxMDA7XG5cdHZhciB0MTtcblx0dmFyIHQyO1xuXHR2YXIgdDM7XG5cdHZhciByZ2I7XG5cdHZhciB2YWw7XG5cblx0aWYgKHMgPT09IDApIHtcblx0XHR2YWwgPSBsICogMjU1O1xuXHRcdHJldHVybiBbdmFsLCB2YWwsIHZhbF07XG5cdH1cblxuXHRpZiAobCA8IDAuNSkge1xuXHRcdHQyID0gbCAqICgxICsgcyk7XG5cdH0gZWxzZSB7XG5cdFx0dDIgPSBsICsgcyAtIGwgKiBzO1xuXHR9XG5cblx0dDEgPSAyICogbCAtIHQyO1xuXG5cdHJnYiA9IFswLCAwLCAwXTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHR0MyA9IGggKyAxIC8gMyAqIC0oaSAtIDEpO1xuXHRcdGlmICh0MyA8IDApIHtcblx0XHRcdHQzKys7XG5cdFx0fVxuXHRcdGlmICh0MyA+IDEpIHtcblx0XHRcdHQzLS07XG5cdFx0fVxuXG5cdFx0aWYgKDYgKiB0MyA8IDEpIHtcblx0XHRcdHZhbCA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzO1xuXHRcdH0gZWxzZSBpZiAoMiAqIHQzIDwgMSkge1xuXHRcdFx0dmFsID0gdDI7XG5cdFx0fSBlbHNlIGlmICgzICogdDMgPCAyKSB7XG5cdFx0XHR2YWwgPSB0MSArICh0MiAtIHQxKSAqICgyIC8gMyAtIHQzKSAqIDY7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbCA9IHQxO1xuXHRcdH1cblxuXHRcdHJnYltpXSA9IHZhbCAqIDI1NTtcblx0fVxuXG5cdHJldHVybiByZ2I7XG59O1xuXG5jb252ZXJ0LmhzbC5oc3YgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBoID0gaHNsWzBdO1xuXHR2YXIgcyA9IGhzbFsxXSAvIDEwMDtcblx0dmFyIGwgPSBoc2xbMl0gLyAxMDA7XG5cdHZhciBzbWluID0gcztcblx0dmFyIGxtaW4gPSBNYXRoLm1heChsLCAwLjAxKTtcblx0dmFyIHN2O1xuXHR2YXIgdjtcblxuXHRsICo9IDI7XG5cdHMgKj0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG5cdHNtaW4gKj0gbG1pbiA8PSAxID8gbG1pbiA6IDIgLSBsbWluO1xuXHR2ID0gKGwgKyBzKSAvIDI7XG5cdHN2ID0gbCA9PT0gMCA/ICgyICogc21pbikgLyAobG1pbiArIHNtaW4pIDogKDIgKiBzKSAvIChsICsgcyk7XG5cblx0cmV0dXJuIFtoLCBzdiAqIDEwMCwgdiAqIDEwMF07XG59O1xuXG5jb252ZXJ0Lmhzdi5yZ2IgPSBmdW5jdGlvbiAoaHN2KSB7XG5cdHZhciBoID0gaHN2WzBdIC8gNjA7XG5cdHZhciBzID0gaHN2WzFdIC8gMTAwO1xuXHR2YXIgdiA9IGhzdlsyXSAvIDEwMDtcblx0dmFyIGhpID0gTWF0aC5mbG9vcihoKSAlIDY7XG5cblx0dmFyIGYgPSBoIC0gTWF0aC5mbG9vcihoKTtcblx0dmFyIHAgPSAyNTUgKiB2ICogKDEgLSBzKTtcblx0dmFyIHEgPSAyNTUgKiB2ICogKDEgLSAocyAqIGYpKTtcblx0dmFyIHQgPSAyNTUgKiB2ICogKDEgLSAocyAqICgxIC0gZikpKTtcblx0diAqPSAyNTU7XG5cblx0c3dpdGNoIChoaSkge1xuXHRcdGNhc2UgMDpcblx0XHRcdHJldHVybiBbdiwgdCwgcF07XG5cdFx0Y2FzZSAxOlxuXHRcdFx0cmV0dXJuIFtxLCB2LCBwXTtcblx0XHRjYXNlIDI6XG5cdFx0XHRyZXR1cm4gW3AsIHYsIHRdO1xuXHRcdGNhc2UgMzpcblx0XHRcdHJldHVybiBbcCwgcSwgdl07XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIFt0LCBwLCB2XTtcblx0XHRjYXNlIDU6XG5cdFx0XHRyZXR1cm4gW3YsIHAsIHFdO1xuXHR9XG59O1xuXG5jb252ZXJ0Lmhzdi5oc2wgPSBmdW5jdGlvbiAoaHN2KSB7XG5cdHZhciBoID0gaHN2WzBdO1xuXHR2YXIgcyA9IGhzdlsxXSAvIDEwMDtcblx0dmFyIHYgPSBoc3ZbMl0gLyAxMDA7XG5cdHZhciB2bWluID0gTWF0aC5tYXgodiwgMC4wMSk7XG5cdHZhciBsbWluO1xuXHR2YXIgc2w7XG5cdHZhciBsO1xuXG5cdGwgPSAoMiAtIHMpICogdjtcblx0bG1pbiA9ICgyIC0gcykgKiB2bWluO1xuXHRzbCA9IHMgKiB2bWluO1xuXHRzbCAvPSAobG1pbiA8PSAxKSA/IGxtaW4gOiAyIC0gbG1pbjtcblx0c2wgPSBzbCB8fCAwO1xuXHRsIC89IDI7XG5cblx0cmV0dXJuIFtoLCBzbCAqIDEwMCwgbCAqIDEwMF07XG59O1xuXG4vLyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtY29sb3IvI2h3Yi10by1yZ2JcbmNvbnZlcnQuaHdiLnJnYiA9IGZ1bmN0aW9uIChod2IpIHtcblx0dmFyIGggPSBod2JbMF0gLyAzNjA7XG5cdHZhciB3aCA9IGh3YlsxXSAvIDEwMDtcblx0dmFyIGJsID0gaHdiWzJdIC8gMTAwO1xuXHR2YXIgcmF0aW8gPSB3aCArIGJsO1xuXHR2YXIgaTtcblx0dmFyIHY7XG5cdHZhciBmO1xuXHR2YXIgbjtcblxuXHQvLyB3aCArIGJsIGNhbnQgYmUgPiAxXG5cdGlmIChyYXRpbyA+IDEpIHtcblx0XHR3aCAvPSByYXRpbztcblx0XHRibCAvPSByYXRpbztcblx0fVxuXG5cdGkgPSBNYXRoLmZsb29yKDYgKiBoKTtcblx0diA9IDEgLSBibDtcblx0ZiA9IDYgKiBoIC0gaTtcblxuXHRpZiAoKGkgJiAweDAxKSAhPT0gMCkge1xuXHRcdGYgPSAxIC0gZjtcblx0fVxuXG5cdG4gPSB3aCArIGYgKiAodiAtIHdoKTsgLy8gbGluZWFyIGludGVycG9sYXRpb25cblxuXHR2YXIgcjtcblx0dmFyIGc7XG5cdHZhciBiO1xuXHRzd2l0Y2ggKGkpIHtcblx0XHRkZWZhdWx0OlxuXHRcdGNhc2UgNjpcblx0XHRjYXNlIDA6IHIgPSB2OyBnID0gbjsgYiA9IHdoOyBicmVhaztcblx0XHRjYXNlIDE6IHIgPSBuOyBnID0gdjsgYiA9IHdoOyBicmVhaztcblx0XHRjYXNlIDI6IHIgPSB3aDsgZyA9IHY7IGIgPSBuOyBicmVhaztcblx0XHRjYXNlIDM6IHIgPSB3aDsgZyA9IG47IGIgPSB2OyBicmVhaztcblx0XHRjYXNlIDQ6IHIgPSBuOyBnID0gd2g7IGIgPSB2OyBicmVhaztcblx0XHRjYXNlIDU6IHIgPSB2OyBnID0gd2g7IGIgPSBuOyBicmVhaztcblx0fVxuXG5cdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59O1xuXG5jb252ZXJ0LmNteWsucmdiID0gZnVuY3Rpb24gKGNteWspIHtcblx0dmFyIGMgPSBjbXlrWzBdIC8gMTAwO1xuXHR2YXIgbSA9IGNteWtbMV0gLyAxMDA7XG5cdHZhciB5ID0gY215a1syXSAvIDEwMDtcblx0dmFyIGsgPSBjbXlrWzNdIC8gMTAwO1xuXHR2YXIgcjtcblx0dmFyIGc7XG5cdHZhciBiO1xuXG5cdHIgPSAxIC0gTWF0aC5taW4oMSwgYyAqICgxIC0gaykgKyBrKTtcblx0ZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspO1xuXHRiID0gMSAtIE1hdGgubWluKDEsIHkgKiAoMSAtIGspICsgayk7XG5cblx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn07XG5cbmNvbnZlcnQueHl6LnJnYiA9IGZ1bmN0aW9uICh4eXopIHtcblx0dmFyIHggPSB4eXpbMF0gLyAxMDA7XG5cdHZhciB5ID0geHl6WzFdIC8gMTAwO1xuXHR2YXIgeiA9IHh5elsyXSAvIDEwMDtcblx0dmFyIHI7XG5cdHZhciBnO1xuXHR2YXIgYjtcblxuXHRyID0gKHggKiAzLjI0MDYpICsgKHkgKiAtMS41MzcyKSArICh6ICogLTAuNDk4Nik7XG5cdGcgPSAoeCAqIC0wLjk2ODkpICsgKHkgKiAxLjg3NTgpICsgKHogKiAwLjA0MTUpO1xuXHRiID0gKHggKiAwLjA1NTcpICsgKHkgKiAtMC4yMDQwKSArICh6ICogMS4wNTcwKTtcblxuXHQvLyBhc3N1bWUgc1JHQlxuXHRyID0gciA+IDAuMDAzMTMwOFxuXHRcdD8gKCgxLjA1NSAqIE1hdGgucG93KHIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG5cdFx0OiByICogMTIuOTI7XG5cblx0ZyA9IGcgPiAwLjAwMzEzMDhcblx0XHQ/ICgoMS4wNTUgKiBNYXRoLnBvdyhnLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuXHRcdDogZyAqIDEyLjkyO1xuXG5cdGIgPSBiID4gMC4wMDMxMzA4XG5cdFx0PyAoKDEuMDU1ICogTWF0aC5wb3coYiwgMS4wIC8gMi40KSkgLSAwLjA1NSlcblx0XHQ6IGIgKiAxMi45MjtcblxuXHRyID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgciksIDEpO1xuXHRnID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgZyksIDEpO1xuXHRiID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgYiksIDEpO1xuXG5cdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59O1xuXG5jb252ZXJ0Lnh5ei5sYWIgPSBmdW5jdGlvbiAoeHl6KSB7XG5cdHZhciB4ID0geHl6WzBdO1xuXHR2YXIgeSA9IHh5elsxXTtcblx0dmFyIHogPSB4eXpbMl07XG5cdHZhciBsO1xuXHR2YXIgYTtcblx0dmFyIGI7XG5cblx0eCAvPSA5NS4wNDc7XG5cdHkgLz0gMTAwO1xuXHR6IC89IDEwOC44ODM7XG5cblx0eCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEgLyAzKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcblx0eSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEgLyAzKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcblx0eiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEgLyAzKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuXHRsID0gKDExNiAqIHkpIC0gMTY7XG5cdGEgPSA1MDAgKiAoeCAtIHkpO1xuXHRiID0gMjAwICogKHkgLSB6KTtcblxuXHRyZXR1cm4gW2wsIGEsIGJdO1xufTtcblxuY29udmVydC5sYWIueHl6ID0gZnVuY3Rpb24gKGxhYikge1xuXHR2YXIgbCA9IGxhYlswXTtcblx0dmFyIGEgPSBsYWJbMV07XG5cdHZhciBiID0gbGFiWzJdO1xuXHR2YXIgeDtcblx0dmFyIHk7XG5cdHZhciB6O1xuXG5cdHkgPSAobCArIDE2KSAvIDExNjtcblx0eCA9IGEgLyA1MDAgKyB5O1xuXHR6ID0geSAtIGIgLyAyMDA7XG5cblx0dmFyIHkyID0gTWF0aC5wb3coeSwgMyk7XG5cdHZhciB4MiA9IE1hdGgucG93KHgsIDMpO1xuXHR2YXIgejIgPSBNYXRoLnBvdyh6LCAzKTtcblx0eSA9IHkyID4gMC4wMDg4NTYgPyB5MiA6ICh5IC0gMTYgLyAxMTYpIC8gNy43ODc7XG5cdHggPSB4MiA+IDAuMDA4ODU2ID8geDIgOiAoeCAtIDE2IC8gMTE2KSAvIDcuNzg3O1xuXHR6ID0gejIgPiAwLjAwODg1NiA/IHoyIDogKHogLSAxNiAvIDExNikgLyA3Ljc4NztcblxuXHR4ICo9IDk1LjA0Nztcblx0eSAqPSAxMDA7XG5cdHogKj0gMTA4Ljg4MztcblxuXHRyZXR1cm4gW3gsIHksIHpdO1xufTtcblxuY29udmVydC5sYWIubGNoID0gZnVuY3Rpb24gKGxhYikge1xuXHR2YXIgbCA9IGxhYlswXTtcblx0dmFyIGEgPSBsYWJbMV07XG5cdHZhciBiID0gbGFiWzJdO1xuXHR2YXIgaHI7XG5cdHZhciBoO1xuXHR2YXIgYztcblxuXHRociA9IE1hdGguYXRhbjIoYiwgYSk7XG5cdGggPSBociAqIDM2MCAvIDIgLyBNYXRoLlBJO1xuXG5cdGlmIChoIDwgMCkge1xuXHRcdGggKz0gMzYwO1xuXHR9XG5cblx0YyA9IE1hdGguc3FydChhICogYSArIGIgKiBiKTtcblxuXHRyZXR1cm4gW2wsIGMsIGhdO1xufTtcblxuY29udmVydC5sY2gubGFiID0gZnVuY3Rpb24gKGxjaCkge1xuXHR2YXIgbCA9IGxjaFswXTtcblx0dmFyIGMgPSBsY2hbMV07XG5cdHZhciBoID0gbGNoWzJdO1xuXHR2YXIgYTtcblx0dmFyIGI7XG5cdHZhciBocjtcblxuXHRociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcblx0YSA9IGMgKiBNYXRoLmNvcyhocik7XG5cdGIgPSBjICogTWF0aC5zaW4oaHIpO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59O1xuXG5jb252ZXJ0LnJnYi5hbnNpMTYgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgciA9IGFyZ3NbMF07XG5cdHZhciBnID0gYXJnc1sxXTtcblx0dmFyIGIgPSBhcmdzWzJdO1xuXHR2YXIgdmFsdWUgPSAxIGluIGFyZ3VtZW50cyA/IGFyZ3VtZW50c1sxXSA6IGNvbnZlcnQucmdiLmhzdihhcmdzKVsyXTsgLy8gaHN2IC0+IGFuc2kxNiBvcHRpbWl6YXRpb25cblxuXHR2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgLyA1MCk7XG5cblx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0cmV0dXJuIDMwO1xuXHR9XG5cblx0dmFyIGFuc2kgPSAzMFxuXHRcdCsgKChNYXRoLnJvdW5kKGIgLyAyNTUpIDw8IDIpXG5cdFx0fCAoTWF0aC5yb3VuZChnIC8gMjU1KSA8PCAxKVxuXHRcdHwgTWF0aC5yb3VuZChyIC8gMjU1KSk7XG5cblx0aWYgKHZhbHVlID09PSAyKSB7XG5cdFx0YW5zaSArPSA2MDtcblx0fVxuXG5cdHJldHVybiBhbnNpO1xufTtcblxuY29udmVydC5oc3YuYW5zaTE2ID0gZnVuY3Rpb24gKGFyZ3MpIHtcblx0Ly8gb3B0aW1pemF0aW9uIGhlcmU7IHdlIGFscmVhZHkga25vdyB0aGUgdmFsdWUgYW5kIGRvbid0IG5lZWQgdG8gZ2V0XG5cdC8vIGl0IGNvbnZlcnRlZCBmb3IgdXMuXG5cdHJldHVybiBjb252ZXJ0LnJnYi5hbnNpMTYoY29udmVydC5oc3YucmdiKGFyZ3MpLCBhcmdzWzJdKTtcbn07XG5cbmNvbnZlcnQucmdiLmFuc2kyNTYgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgciA9IGFyZ3NbMF07XG5cdHZhciBnID0gYXJnc1sxXTtcblx0dmFyIGIgPSBhcmdzWzJdO1xuXG5cdC8vIHdlIHVzZSB0aGUgZXh0ZW5kZWQgZ3JleXNjYWxlIHBhbGV0dGUgaGVyZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG5cdC8vIGJsYWNrIGFuZCB3aGl0ZS4gbm9ybWFsIHBhbGV0dGUgb25seSBoYXMgNCBncmV5c2NhbGUgc2hhZGVzLlxuXHRpZiAociA9PT0gZyAmJiBnID09PSBiKSB7XG5cdFx0aWYgKHIgPCA4KSB7XG5cdFx0XHRyZXR1cm4gMTY7XG5cdFx0fVxuXG5cdFx0aWYgKHIgPiAyNDgpIHtcblx0XHRcdHJldHVybiAyMzE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKChyIC0gOCkgLyAyNDcpICogMjQpICsgMjMyO1xuXHR9XG5cblx0dmFyIGFuc2kgPSAxNlxuXHRcdCsgKDM2ICogTWF0aC5yb3VuZChyIC8gMjU1ICogNSkpXG5cdFx0KyAoNiAqIE1hdGgucm91bmQoZyAvIDI1NSAqIDUpKVxuXHRcdCsgTWF0aC5yb3VuZChiIC8gMjU1ICogNSk7XG5cblx0cmV0dXJuIGFuc2k7XG59O1xuXG5jb252ZXJ0LmFuc2kxNi5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgY29sb3IgPSBhcmdzICUgMTA7XG5cblx0Ly8gaGFuZGxlIGdyZXlzY2FsZVxuXHRpZiAoY29sb3IgPT09IDAgfHwgY29sb3IgPT09IDcpIHtcblx0XHRpZiAoYXJncyA+IDUwKSB7XG5cdFx0XHRjb2xvciArPSAzLjU7XG5cdFx0fVxuXG5cdFx0Y29sb3IgPSBjb2xvciAvIDEwLjUgKiAyNTU7XG5cblx0XHRyZXR1cm4gW2NvbG9yLCBjb2xvciwgY29sb3JdO1xuXHR9XG5cblx0dmFyIG11bHQgPSAofn4oYXJncyA+IDUwKSArIDEpICogMC41O1xuXHR2YXIgciA9ICgoY29sb3IgJiAxKSAqIG11bHQpICogMjU1O1xuXHR2YXIgZyA9ICgoKGNvbG9yID4+IDEpICYgMSkgKiBtdWx0KSAqIDI1NTtcblx0dmFyIGIgPSAoKChjb2xvciA+PiAyKSAmIDEpICogbXVsdCkgKiAyNTU7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQuYW5zaTI1Ni5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHQvLyBoYW5kbGUgZ3JleXNjYWxlXG5cdGlmIChhcmdzID49IDIzMikge1xuXHRcdHZhciBjID0gKGFyZ3MgLSAyMzIpICogMTAgKyA4O1xuXHRcdHJldHVybiBbYywgYywgY107XG5cdH1cblxuXHRhcmdzIC09IDE2O1xuXG5cdHZhciByZW07XG5cdHZhciByID0gTWF0aC5mbG9vcihhcmdzIC8gMzYpIC8gNSAqIDI1NTtcblx0dmFyIGcgPSBNYXRoLmZsb29yKChyZW0gPSBhcmdzICUgMzYpIC8gNikgLyA1ICogMjU1O1xuXHR2YXIgYiA9IChyZW0gJSA2KSAvIDUgKiAyNTU7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQucmdiLmhleCA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciBpbnRlZ2VyID0gKChNYXRoLnJvdW5kKGFyZ3NbMF0pICYgMHhGRikgPDwgMTYpXG5cdFx0KyAoKE1hdGgucm91bmQoYXJnc1sxXSkgJiAweEZGKSA8PCA4KVxuXHRcdCsgKE1hdGgucm91bmQoYXJnc1syXSkgJiAweEZGKTtcblxuXHR2YXIgc3RyaW5nID0gaW50ZWdlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblx0cmV0dXJuICcwMDAwMDAnLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKSArIHN0cmluZztcbn07XG5cbmNvbnZlcnQuaGV4LnJnYiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciBtYXRjaCA9IGFyZ3MudG9TdHJpbmcoMTYpLm1hdGNoKC9bYS1mMC05XXs2fXxbYS1mMC05XXszfS9pKTtcblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBbMCwgMCwgMF07XG5cdH1cblxuXHR2YXIgY29sb3JTdHJpbmcgPSBtYXRjaFswXTtcblxuXHRpZiAobWF0Y2hbMF0ubGVuZ3RoID09PSAzKSB7XG5cdFx0Y29sb3JTdHJpbmcgPSBjb2xvclN0cmluZy5zcGxpdCgnJykubWFwKGZ1bmN0aW9uIChjaGFyKSB7XG5cdFx0XHRyZXR1cm4gY2hhciArIGNoYXI7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHR2YXIgaW50ZWdlciA9IHBhcnNlSW50KGNvbG9yU3RyaW5nLCAxNik7XG5cdHZhciByID0gKGludGVnZXIgPj4gMTYpICYgMHhGRjtcblx0dmFyIGcgPSAoaW50ZWdlciA+PiA4KSAmIDB4RkY7XG5cdHZhciBiID0gaW50ZWdlciAmIDB4RkY7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQucmdiLmhjZyA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIG1heCA9IE1hdGgubWF4KE1hdGgubWF4KHIsIGcpLCBiKTtcblx0dmFyIG1pbiA9IE1hdGgubWluKE1hdGgubWluKHIsIGcpLCBiKTtcblx0dmFyIGNocm9tYSA9IChtYXggLSBtaW4pO1xuXHR2YXIgZ3JheXNjYWxlO1xuXHR2YXIgaHVlO1xuXG5cdGlmIChjaHJvbWEgPCAxKSB7XG5cdFx0Z3JheXNjYWxlID0gbWluIC8gKDEgLSBjaHJvbWEpO1xuXHR9IGVsc2Uge1xuXHRcdGdyYXlzY2FsZSA9IDA7XG5cdH1cblxuXHRpZiAoY2hyb21hIDw9IDApIHtcblx0XHRodWUgPSAwO1xuXHR9IGVsc2Vcblx0aWYgKG1heCA9PT0gcikge1xuXHRcdGh1ZSA9ICgoZyAtIGIpIC8gY2hyb21hKSAlIDY7XG5cdH0gZWxzZVxuXHRpZiAobWF4ID09PSBnKSB7XG5cdFx0aHVlID0gMiArIChiIC0gcikgLyBjaHJvbWE7XG5cdH0gZWxzZSB7XG5cdFx0aHVlID0gNCArIChyIC0gZykgLyBjaHJvbWEgKyA0O1xuXHR9XG5cblx0aHVlIC89IDY7XG5cdGh1ZSAlPSAxO1xuXG5cdHJldHVybiBbaHVlICogMzYwLCBjaHJvbWEgKiAxMDAsIGdyYXlzY2FsZSAqIDEwMF07XG59O1xuXG5jb252ZXJ0LmhzbC5oY2cgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBzID0gaHNsWzFdIC8gMTAwO1xuXHR2YXIgbCA9IGhzbFsyXSAvIDEwMDtcblx0dmFyIGMgPSAxO1xuXHR2YXIgZiA9IDA7XG5cblx0aWYgKGwgPCAwLjUpIHtcblx0XHRjID0gMi4wICogcyAqIGw7XG5cdH0gZWxzZSB7XG5cdFx0YyA9IDIuMCAqIHMgKiAoMS4wIC0gbCk7XG5cdH1cblxuXHRpZiAoYyA8IDEuMCkge1xuXHRcdGYgPSAobCAtIDAuNSAqIGMpIC8gKDEuMCAtIGMpO1xuXHR9XG5cblx0cmV0dXJuIFtoc2xbMF0sIGMgKiAxMDAsIGYgKiAxMDBdO1xufTtcblxuY29udmVydC5oc3YuaGNnID0gZnVuY3Rpb24gKGhzdikge1xuXHR2YXIgcyA9IGhzdlsxXSAvIDEwMDtcblx0dmFyIHYgPSBoc3ZbMl0gLyAxMDA7XG5cblx0dmFyIGMgPSBzICogdjtcblx0dmFyIGYgPSAwO1xuXG5cdGlmIChjIDwgMS4wKSB7XG5cdFx0ZiA9ICh2IC0gYykgLyAoMSAtIGMpO1xuXHR9XG5cblx0cmV0dXJuIFtoc3ZbMF0sIGMgKiAxMDAsIGYgKiAxMDBdO1xufTtcblxuY29udmVydC5oY2cucmdiID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgaCA9IGhjZ1swXSAvIDM2MDtcblx0dmFyIGMgPSBoY2dbMV0gLyAxMDA7XG5cdHZhciBnID0gaGNnWzJdIC8gMTAwO1xuXG5cdGlmIChjID09PSAwLjApIHtcblx0XHRyZXR1cm4gW2cgKiAyNTUsIGcgKiAyNTUsIGcgKiAyNTVdO1xuXHR9XG5cblx0dmFyIHB1cmUgPSBbMCwgMCwgMF07XG5cdHZhciBoaSA9IChoICUgMSkgKiA2O1xuXHR2YXIgdiA9IGhpICUgMTtcblx0dmFyIHcgPSAxIC0gdjtcblx0dmFyIG1nID0gMDtcblxuXHRzd2l0Y2ggKE1hdGguZmxvb3IoaGkpKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0cHVyZVswXSA9IDE7IHB1cmVbMV0gPSB2OyBwdXJlWzJdID0gMDsgYnJlYWs7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0cHVyZVswXSA9IHc7IHB1cmVbMV0gPSAxOyBwdXJlWzJdID0gMDsgYnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0cHVyZVswXSA9IDA7IHB1cmVbMV0gPSAxOyBwdXJlWzJdID0gdjsgYnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cHVyZVswXSA9IDA7IHB1cmVbMV0gPSB3OyBwdXJlWzJdID0gMTsgYnJlYWs7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cHVyZVswXSA9IHY7IHB1cmVbMV0gPSAwOyBwdXJlWzJdID0gMTsgYnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHB1cmVbMF0gPSAxOyBwdXJlWzFdID0gMDsgcHVyZVsyXSA9IHc7XG5cdH1cblxuXHRtZyA9ICgxLjAgLSBjKSAqIGc7XG5cblx0cmV0dXJuIFtcblx0XHQoYyAqIHB1cmVbMF0gKyBtZykgKiAyNTUsXG5cdFx0KGMgKiBwdXJlWzFdICsgbWcpICogMjU1LFxuXHRcdChjICogcHVyZVsyXSArIG1nKSAqIDI1NVxuXHRdO1xufTtcblxuY29udmVydC5oY2cuaHN2ID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cblx0dmFyIHYgPSBjICsgZyAqICgxLjAgLSBjKTtcblx0dmFyIGYgPSAwO1xuXG5cdGlmICh2ID4gMC4wKSB7XG5cdFx0ZiA9IGMgLyB2O1xuXHR9XG5cblx0cmV0dXJuIFtoY2dbMF0sIGYgKiAxMDAsIHYgKiAxMDBdO1xufTtcblxuY29udmVydC5oY2cuaHNsID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cblx0dmFyIGwgPSBnICogKDEuMCAtIGMpICsgMC41ICogYztcblx0dmFyIHMgPSAwO1xuXG5cdGlmIChsID4gMC4wICYmIGwgPCAwLjUpIHtcblx0XHRzID0gYyAvICgyICogbCk7XG5cdH0gZWxzZVxuXHRpZiAobCA+PSAwLjUgJiYgbCA8IDEuMCkge1xuXHRcdHMgPSBjIC8gKDIgKiAoMSAtIGwpKTtcblx0fVxuXG5cdHJldHVybiBbaGNnWzBdLCBzICogMTAwLCBsICogMTAwXTtcbn07XG5cbmNvbnZlcnQuaGNnLmh3YiA9IGZ1bmN0aW9uIChoY2cpIHtcblx0dmFyIGMgPSBoY2dbMV0gLyAxMDA7XG5cdHZhciBnID0gaGNnWzJdIC8gMTAwO1xuXHR2YXIgdiA9IGMgKyBnICogKDEuMCAtIGMpO1xuXHRyZXR1cm4gW2hjZ1swXSwgKHYgLSBjKSAqIDEwMCwgKDEgLSB2KSAqIDEwMF07XG59O1xuXG5jb252ZXJ0Lmh3Yi5oY2cgPSBmdW5jdGlvbiAoaHdiKSB7XG5cdHZhciB3ID0gaHdiWzFdIC8gMTAwO1xuXHR2YXIgYiA9IGh3YlsyXSAvIDEwMDtcblx0dmFyIHYgPSAxIC0gYjtcblx0dmFyIGMgPSB2IC0gdztcblx0dmFyIGcgPSAwO1xuXG5cdGlmIChjIDwgMSkge1xuXHRcdGcgPSAodiAtIGMpIC8gKDEgLSBjKTtcblx0fVxuXG5cdHJldHVybiBbaHdiWzBdLCBjICogMTAwLCBnICogMTAwXTtcbn07XG5cbmNvbnZlcnQuYXBwbGUucmdiID0gZnVuY3Rpb24gKGFwcGxlKSB7XG5cdHJldHVybiBbKGFwcGxlWzBdIC8gNjU1MzUpICogMjU1LCAoYXBwbGVbMV0gLyA2NTUzNSkgKiAyNTUsIChhcHBsZVsyXSAvIDY1NTM1KSAqIDI1NV07XG59O1xuXG5jb252ZXJ0LnJnYi5hcHBsZSA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0cmV0dXJuIFsocmdiWzBdIC8gMjU1KSAqIDY1NTM1LCAocmdiWzFdIC8gMjU1KSAqIDY1NTM1LCAocmdiWzJdIC8gMjU1KSAqIDY1NTM1XTtcbn07XG5cbmNvbnZlcnQuZ3JheS5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHRyZXR1cm4gW2FyZ3NbMF0gLyAxMDAgKiAyNTUsIGFyZ3NbMF0gLyAxMDAgKiAyNTUsIGFyZ3NbMF0gLyAxMDAgKiAyNTVdO1xufTtcblxuY29udmVydC5ncmF5LmhzbCA9IGNvbnZlcnQuZ3JheS5oc3YgPSBmdW5jdGlvbiAoYXJncykge1xuXHRyZXR1cm4gWzAsIDAsIGFyZ3NbMF1dO1xufTtcblxuY29udmVydC5ncmF5Lmh3YiA9IGZ1bmN0aW9uIChncmF5KSB7XG5cdHJldHVybiBbMCwgMTAwLCBncmF5WzBdXTtcbn07XG5cbmNvbnZlcnQuZ3JheS5jbXlrID0gZnVuY3Rpb24gKGdyYXkpIHtcblx0cmV0dXJuIFswLCAwLCAwLCBncmF5WzBdXTtcbn07XG5cbmNvbnZlcnQuZ3JheS5sYWIgPSBmdW5jdGlvbiAoZ3JheSkge1xuXHRyZXR1cm4gW2dyYXlbMF0sIDAsIDBdO1xufTtcblxuY29udmVydC5ncmF5LmhleCA9IGZ1bmN0aW9uIChncmF5KSB7XG5cdHZhciB2YWwgPSBNYXRoLnJvdW5kKGdyYXlbMF0gLyAxMDAgKiAyNTUpICYgMHhGRjtcblx0dmFyIGludGVnZXIgPSAodmFsIDw8IDE2KSArICh2YWwgPDwgOCkgKyB2YWw7XG5cblx0dmFyIHN0cmluZyA9IGludGVnZXIudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdHJldHVybiAnMDAwMDAwJy5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCkgKyBzdHJpbmc7XG59O1xuXG5jb252ZXJ0LnJnYi5ncmF5ID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgdmFsID0gKHJnYlswXSArIHJnYlsxXSArIHJnYlsyXSkgLyAzO1xuXHRyZXR1cm4gW3ZhbCAvIDI1NSAqIDEwMF07XG59O1xuIiwidmFyIGNvbnZlcnNpb25zID0gcmVxdWlyZSgnLi9jb252ZXJzaW9ucycpO1xuXG4vKlxuXHR0aGlzIGZ1bmN0aW9uIHJvdXRlcyBhIG1vZGVsIHRvIGFsbCBvdGhlciBtb2RlbHMuXG5cblx0YWxsIGZ1bmN0aW9ucyB0aGF0IGFyZSByb3V0ZWQgaGF2ZSBhIHByb3BlcnR5IGAuY29udmVyc2lvbmAgYXR0YWNoZWRcblx0dG8gdGhlIHJldHVybmVkIHN5bnRoZXRpYyBmdW5jdGlvbi4gVGhpcyBwcm9wZXJ0eSBpcyBhbiBhcnJheVxuXHRvZiBzdHJpbmdzLCBlYWNoIHdpdGggdGhlIHN0ZXBzIGluIGJldHdlZW4gdGhlICdmcm9tJyBhbmQgJ3RvJ1xuXHRjb2xvciBtb2RlbHMgKGluY2x1c2l2ZSkuXG5cblx0Y29udmVyc2lvbnMgdGhhdCBhcmUgbm90IHBvc3NpYmxlIHNpbXBseSBhcmUgbm90IGluY2x1ZGVkLlxuKi9cblxuZnVuY3Rpb24gYnVpbGRHcmFwaCgpIHtcblx0dmFyIGdyYXBoID0ge307XG5cdC8vIGh0dHBzOi8vanNwZXJmLmNvbS9vYmplY3Qta2V5cy12cy1mb3ItaW4td2l0aC1jbG9zdXJlLzNcblx0dmFyIG1vZGVscyA9IE9iamVjdC5rZXlzKGNvbnZlcnNpb25zKTtcblxuXHRmb3IgKHZhciBsZW4gPSBtb2RlbHMubGVuZ3RoLCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0Z3JhcGhbbW9kZWxzW2ldXSA9IHtcblx0XHRcdC8vIGh0dHA6Ly9qc3BlcmYuY29tLzEtdnMtaW5maW5pdHlcblx0XHRcdC8vIG1pY3JvLW9wdCwgYnV0IHRoaXMgaXMgc2ltcGxlLlxuXHRcdFx0ZGlzdGFuY2U6IC0xLFxuXHRcdFx0cGFyZW50OiBudWxsXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBncmFwaDtcbn1cblxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQnJlYWR0aC1maXJzdF9zZWFyY2hcbmZ1bmN0aW9uIGRlcml2ZUJGUyhmcm9tTW9kZWwpIHtcblx0dmFyIGdyYXBoID0gYnVpbGRHcmFwaCgpO1xuXHR2YXIgcXVldWUgPSBbZnJvbU1vZGVsXTsgLy8gdW5zaGlmdCAtPiBxdWV1ZSAtPiBwb3BcblxuXHRncmFwaFtmcm9tTW9kZWxdLmRpc3RhbmNlID0gMDtcblxuXHR3aGlsZSAocXVldWUubGVuZ3RoKSB7XG5cdFx0dmFyIGN1cnJlbnQgPSBxdWV1ZS5wb3AoKTtcblx0XHR2YXIgYWRqYWNlbnRzID0gT2JqZWN0LmtleXMoY29udmVyc2lvbnNbY3VycmVudF0pO1xuXG5cdFx0Zm9yICh2YXIgbGVuID0gYWRqYWNlbnRzLmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dmFyIGFkamFjZW50ID0gYWRqYWNlbnRzW2ldO1xuXHRcdFx0dmFyIG5vZGUgPSBncmFwaFthZGphY2VudF07XG5cblx0XHRcdGlmIChub2RlLmRpc3RhbmNlID09PSAtMSkge1xuXHRcdFx0XHRub2RlLmRpc3RhbmNlID0gZ3JhcGhbY3VycmVudF0uZGlzdGFuY2UgKyAxO1xuXHRcdFx0XHRub2RlLnBhcmVudCA9IGN1cnJlbnQ7XG5cdFx0XHRcdHF1ZXVlLnVuc2hpZnQoYWRqYWNlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBncmFwaDtcbn1cblxuZnVuY3Rpb24gbGluayhmcm9tLCB0bykge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGFyZ3MpIHtcblx0XHRyZXR1cm4gdG8oZnJvbShhcmdzKSk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHdyYXBDb252ZXJzaW9uKHRvTW9kZWwsIGdyYXBoKSB7XG5cdHZhciBwYXRoID0gW2dyYXBoW3RvTW9kZWxdLnBhcmVudCwgdG9Nb2RlbF07XG5cdHZhciBmbiA9IGNvbnZlcnNpb25zW2dyYXBoW3RvTW9kZWxdLnBhcmVudF1bdG9Nb2RlbF07XG5cblx0dmFyIGN1ciA9IGdyYXBoW3RvTW9kZWxdLnBhcmVudDtcblx0d2hpbGUgKGdyYXBoW2N1cl0ucGFyZW50KSB7XG5cdFx0cGF0aC51bnNoaWZ0KGdyYXBoW2N1cl0ucGFyZW50KTtcblx0XHRmbiA9IGxpbmsoY29udmVyc2lvbnNbZ3JhcGhbY3VyXS5wYXJlbnRdW2N1cl0sIGZuKTtcblx0XHRjdXIgPSBncmFwaFtjdXJdLnBhcmVudDtcblx0fVxuXG5cdGZuLmNvbnZlcnNpb24gPSBwYXRoO1xuXHRyZXR1cm4gZm47XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZyb21Nb2RlbCkge1xuXHR2YXIgZ3JhcGggPSBkZXJpdmVCRlMoZnJvbU1vZGVsKTtcblx0dmFyIGNvbnZlcnNpb24gPSB7fTtcblxuXHR2YXIgbW9kZWxzID0gT2JqZWN0LmtleXMoZ3JhcGgpO1xuXHRmb3IgKHZhciBsZW4gPSBtb2RlbHMubGVuZ3RoLCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0dmFyIHRvTW9kZWwgPSBtb2RlbHNbaV07XG5cdFx0dmFyIG5vZGUgPSBncmFwaFt0b01vZGVsXTtcblxuXHRcdGlmIChub2RlLnBhcmVudCA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gbm8gcG9zc2libGUgY29udmVyc2lvbiwgb3IgdGhpcyBub2RlIGlzIHRoZSBzb3VyY2UgbW9kZWwuXG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb252ZXJzaW9uW3RvTW9kZWxdID0gd3JhcENvbnZlcnNpb24odG9Nb2RlbCwgZ3JhcGgpO1xuXHR9XG5cblx0cmV0dXJuIGNvbnZlcnNpb247XG59O1xuXG4iLCJ2YXIgY29udmVyc2lvbnMgPSByZXF1aXJlKCcuL2NvbnZlcnNpb25zJyk7XG52YXIgcm91dGUgPSByZXF1aXJlKCcuL3JvdXRlJyk7XG5cbnZhciBjb252ZXJ0ID0ge307XG5cbnZhciBtb2RlbHMgPSBPYmplY3Qua2V5cyhjb252ZXJzaW9ucyk7XG5cbmZ1bmN0aW9uIHdyYXBSYXcoZm4pIHtcblx0dmFyIHdyYXBwZWRGbiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdFx0aWYgKGFyZ3MgPT09IHVuZGVmaW5lZCB8fCBhcmdzID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gYXJncztcblx0XHR9XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmbihhcmdzKTtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbmZ1bmN0aW9uIHdyYXBSb3VuZGVkKGZuKSB7XG5cdHZhciB3cmFwcGVkRm4gPSBmdW5jdGlvbiAoYXJncykge1xuXHRcdGlmIChhcmdzID09PSB1bmRlZmluZWQgfHwgYXJncyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGFyZ3M7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0ID0gZm4oYXJncyk7XG5cblx0XHQvLyB3ZSdyZSBhc3N1bWluZyB0aGUgcmVzdWx0IGlzIGFuIGFycmF5IGhlcmUuXG5cdFx0Ly8gc2VlIG5vdGljZSBpbiBjb252ZXJzaW9ucy5qczsgZG9uJ3QgdXNlIGJveCB0eXBlc1xuXHRcdC8vIGluIGNvbnZlcnNpb24gZnVuY3Rpb25zLlxuXHRcdGlmICh0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0Zm9yICh2YXIgbGVuID0gcmVzdWx0Lmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChmcm9tTW9kZWwpIHtcblx0Y29udmVydFtmcm9tTW9kZWxdID0ge307XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnZlcnRbZnJvbU1vZGVsXSwgJ2NoYW5uZWxzJywge3ZhbHVlOiBjb252ZXJzaW9uc1tmcm9tTW9kZWxdLmNoYW5uZWxzfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb252ZXJ0W2Zyb21Nb2RlbF0sICdsYWJlbHMnLCB7dmFsdWU6IGNvbnZlcnNpb25zW2Zyb21Nb2RlbF0ubGFiZWxzfSk7XG5cblx0dmFyIHJvdXRlcyA9IHJvdXRlKGZyb21Nb2RlbCk7XG5cdHZhciByb3V0ZU1vZGVscyA9IE9iamVjdC5rZXlzKHJvdXRlcyk7XG5cblx0cm91dGVNb2RlbHMuZm9yRWFjaChmdW5jdGlvbiAodG9Nb2RlbCkge1xuXHRcdHZhciBmbiA9IHJvdXRlc1t0b01vZGVsXTtcblxuXHRcdGNvbnZlcnRbZnJvbU1vZGVsXVt0b01vZGVsXSA9IHdyYXBSb3VuZGVkKGZuKTtcblx0XHRjb252ZXJ0W2Zyb21Nb2RlbF1bdG9Nb2RlbF0ucmF3ID0gd3JhcFJhdyhmbik7XG5cdH0pO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udmVydDtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxMiBIZWF0aGVyIEFydGh1clxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbi8vIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbi8vIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuLy8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuLy8gaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4vLyBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG4vLyBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXG4vLyBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXG4vLyBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGNvbG9yU3RyaW5nID0gcmVxdWlyZShcImNvbG9yLXN0cmluZ1wiKTtcbnZhciBjb252ZXJ0ID0gcmVxdWlyZShcImNvbG9yLWNvbnZlcnRcIik7XG5cbnZhciBfc2xpY2UgPSBbXS5zbGljZTtcblxudmFyIHNraXBwZWRNb2RlbHMgPSBbXG4gIC8vIHRvIGJlIGhvbmVzdCwgSSBkb24ndCByZWFsbHkgZmVlbCBsaWtlIGtleXdvcmQgYmVsb25ncyBpbiBjb2xvciBjb252ZXJ0LCBidXQgZWguXG4gIFwia2V5d29yZFwiLFxuXG4gIC8vIGdyYXkgY29uZmxpY3RzIHdpdGggc29tZSBtZXRob2QgbmFtZXMsIGFuZCBoYXMgaXRzIG93biBtZXRob2QgZGVmaW5lZC5cbiAgXCJncmF5XCIsXG5cbiAgLy8gc2hvdWxkbid0IHJlYWxseSBiZSBpbiBjb2xvci1jb252ZXJ0IGVpdGhlci4uLlxuICBcImhleFwiLFxuXTtcblxudmFyIGhhc2hlZE1vZGVsS2V5cyA9IHt9O1xuT2JqZWN0LmtleXMoY29udmVydCkuZm9yRWFjaChmdW5jdGlvbiAobW9kZWwpIHtcbiAgaGFzaGVkTW9kZWxLZXlzW19zbGljZS5jYWxsKGNvbnZlcnRbbW9kZWxdLmxhYmVscykuc29ydCgpLmpvaW4oXCJcIildID0gbW9kZWw7XG59KTtcblxudmFyIGxpbWl0ZXJzID0ge307XG5cbmZ1bmN0aW9uIENvbG9yKG9iaiwgbW9kZWwpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENvbG9yKSkge1xuICAgIHJldHVybiBuZXcgQ29sb3Iob2JqLCBtb2RlbCk7XG4gIH1cblxuICBpZiAobW9kZWwgJiYgbW9kZWwgaW4gc2tpcHBlZE1vZGVscykge1xuICAgIG1vZGVsID0gbnVsbDtcbiAgfVxuXG4gIGlmIChtb2RlbCAmJiAhKG1vZGVsIGluIGNvbnZlcnQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBtb2RlbDogXCIgKyBtb2RlbCk7XG4gIH1cblxuICB2YXIgaTtcbiAgdmFyIGNoYW5uZWxzO1xuXG4gIGlmIChvYmogPT0gbnVsbCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCxlcWVxZXFcbiAgICB0aGlzLm1vZGVsID0gXCJyZ2JcIjtcbiAgICB0aGlzLmNvbG9yID0gWzAsIDAsIDBdO1xuICAgIHRoaXMudmFscGhhID0gMTtcbiAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBDb2xvcikge1xuICAgIHRoaXMubW9kZWwgPSBvYmoubW9kZWw7XG4gICAgdGhpcy5jb2xvciA9IG9iai5jb2xvci5zbGljZSgpO1xuICAgIHRoaXMudmFscGhhID0gb2JqLnZhbHBoYTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSB7XG4gICAgdmFyIHJlc3VsdCA9IGNvbG9yU3RyaW5nLmdldChvYmopO1xuICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIHN0cmluZzogXCIgKyBvYmopO1xuICAgIH1cblxuICAgIHRoaXMubW9kZWwgPSByZXN1bHQubW9kZWw7XG4gICAgY2hhbm5lbHMgPSBjb252ZXJ0W3RoaXMubW9kZWxdLmNoYW5uZWxzO1xuICAgIHRoaXMuY29sb3IgPSByZXN1bHQudmFsdWUuc2xpY2UoMCwgY2hhbm5lbHMpO1xuICAgIHRoaXMudmFscGhhID0gdHlwZW9mIHJlc3VsdC52YWx1ZVtjaGFubmVsc10gPT09IFwibnVtYmVyXCIgPyByZXN1bHQudmFsdWVbY2hhbm5lbHNdIDogMTtcbiAgfSBlbHNlIGlmIChvYmoubGVuZ3RoKSB7XG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsIHx8IFwicmdiXCI7XG4gICAgY2hhbm5lbHMgPSBjb252ZXJ0W3RoaXMubW9kZWxdLmNoYW5uZWxzO1xuICAgIHZhciBuZXdBcnIgPSBfc2xpY2UuY2FsbChvYmosIDAsIGNoYW5uZWxzKTtcbiAgICB0aGlzLmNvbG9yID0gemVyb0FycmF5KG5ld0FyciwgY2hhbm5lbHMpO1xuICAgIHRoaXMudmFscGhhID0gdHlwZW9mIG9ialtjaGFubmVsc10gPT09IFwibnVtYmVyXCIgPyBvYmpbY2hhbm5lbHNdIDogMTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSBcIm51bWJlclwiKSB7XG4gICAgLy8gdGhpcyBpcyBhbHdheXMgUkdCIC0gY2FuIGJlIGNvbnZlcnRlZCBsYXRlciBvbi5cbiAgICBvYmogJj0gMHhmZmZmZmY7XG4gICAgdGhpcy5tb2RlbCA9IFwicmdiXCI7XG4gICAgdGhpcy5jb2xvciA9IFsob2JqID4+IDE2KSAmIDB4ZmYsIChvYmogPj4gOCkgJiAweGZmLCBvYmogJiAweGZmXTtcbiAgICB0aGlzLnZhbHBoYSA9IDE7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy52YWxwaGEgPSAxO1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIGlmIChcImFscGhhXCIgaW4gb2JqKSB7XG4gICAgICBrZXlzLnNwbGljZShrZXlzLmluZGV4T2YoXCJhbHBoYVwiKSwgMSk7XG4gICAgICB0aGlzLnZhbHBoYSA9IHR5cGVvZiBvYmouYWxwaGEgPT09IFwibnVtYmVyXCIgPyBvYmouYWxwaGEgOiAwO1xuICAgIH1cblxuICAgIHZhciBoYXNoZWRLZXlzID0ga2V5cy5zb3J0KCkuam9pbihcIlwiKTtcbiAgICBpZiAoIShoYXNoZWRLZXlzIGluIGhhc2hlZE1vZGVsS2V5cykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIG9iamVjdDogXCIgKyBKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICB9XG5cbiAgICB0aGlzLm1vZGVsID0gaGFzaGVkTW9kZWxLZXlzW2hhc2hlZEtleXNdO1xuXG4gICAgdmFyIGxhYmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0ubGFiZWxzO1xuICAgIHZhciBjb2xvciA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbG9yLnB1c2gob2JqW2xhYmVsc1tpXV0pO1xuICAgIH1cblxuICAgIHRoaXMuY29sb3IgPSB6ZXJvQXJyYXkoY29sb3IpO1xuICB9XG5cbiAgLy8gcGVyZm9ybSBsaW1pdGF0aW9ucyAoY2xhbXBpbmcsIGV0Yy4pXG4gIGlmIChsaW1pdGVyc1t0aGlzLm1vZGVsXSkge1xuICAgIGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2hhbm5lbHM7IGkrKykge1xuICAgICAgdmFyIGxpbWl0ID0gbGltaXRlcnNbdGhpcy5tb2RlbF1baV07XG4gICAgICBpZiAobGltaXQpIHtcbiAgICAgICAgdGhpcy5jb2xvcltpXSA9IGxpbWl0KHRoaXMuY29sb3JbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMudmFscGhhID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdGhpcy52YWxwaGEpKTtcblxuICBpZiAoT2JqZWN0LmZyZWV6ZSkge1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbn1cblxuQ29sb3IucHJvdG90eXBlID0ge1xuICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnN0cmluZygpO1xuICB9LFxuXG4gIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW3RoaXMubW9kZWxdKCk7XG4gIH0sXG5cbiAgc3RyaW5nOiBmdW5jdGlvbiAocGxhY2VzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLm1vZGVsIGluIGNvbG9yU3RyaW5nLnRvID8gdGhpcyA6IHRoaXMucmdiKCk7XG4gICAgc2VsZiA9IHNlbGYucm91bmQodHlwZW9mIHBsYWNlcyA9PT0gXCJudW1iZXJcIiA/IHBsYWNlcyA6IDEpO1xuICAgIHZhciBhcmdzID0gc2VsZi52YWxwaGEgPT09IDEgPyBzZWxmLmNvbG9yIDogc2VsZi5jb2xvci5jb25jYXQodGhpcy52YWxwaGEpO1xuICAgIHJldHVybiBjb2xvclN0cmluZy50b1tzZWxmLm1vZGVsXShhcmdzKTtcbiAgfSxcblxuICBwZXJjZW50U3RyaW5nOiBmdW5jdGlvbiAocGxhY2VzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLnJnYigpLnJvdW5kKHR5cGVvZiBwbGFjZXMgPT09IFwibnVtYmVyXCIgPyBwbGFjZXMgOiAxKTtcbiAgICB2YXIgYXJncyA9IHNlbGYudmFscGhhID09PSAxID8gc2VsZi5jb2xvciA6IHNlbGYuY29sb3IuY29uY2F0KHRoaXMudmFscGhhKTtcbiAgICByZXR1cm4gY29sb3JTdHJpbmcudG8ucmdiLnBlcmNlbnQoYXJncyk7XG4gIH0sXG5cbiAgYXJyYXk6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy52YWxwaGEgPT09IDEgPyB0aGlzLmNvbG9yLnNsaWNlKCkgOiB0aGlzLmNvbG9yLmNvbmNhdCh0aGlzLnZhbHBoYSk7XG4gIH0sXG5cbiAgb2JqZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBjaGFubmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0uY2hhbm5lbHM7XG4gICAgdmFyIGxhYmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0ubGFiZWxzO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFubmVsczsgaSsrKSB7XG4gICAgICByZXN1bHRbbGFiZWxzW2ldXSA9IHRoaXMuY29sb3JbaV07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudmFscGhhICE9PSAxKSB7XG4gICAgICByZXN1bHQuYWxwaGEgPSB0aGlzLnZhbHBoYTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIHVuaXRBcnJheTogZnVuY3Rpb24gKCkge1xuICAgIHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuICAgIHJnYlswXSAvPSAyNTU7XG4gICAgcmdiWzFdIC89IDI1NTtcbiAgICByZ2JbMl0gLz0gMjU1O1xuXG4gICAgaWYgKHRoaXMudmFscGhhICE9PSAxKSB7XG4gICAgICByZ2IucHVzaCh0aGlzLnZhbHBoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJnYjtcbiAgfSxcblxuICB1bml0T2JqZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJnYiA9IHRoaXMucmdiKCkub2JqZWN0KCk7XG4gICAgcmdiLnIgLz0gMjU1O1xuICAgIHJnYi5nIC89IDI1NTtcbiAgICByZ2IuYiAvPSAyNTU7XG5cbiAgICBpZiAodGhpcy52YWxwaGEgIT09IDEpIHtcbiAgICAgIHJnYi5hbHBoYSA9IHRoaXMudmFscGhhO1xuICAgIH1cblxuICAgIHJldHVybiByZ2I7XG4gIH0sXG5cbiAgcm91bmQ6IGZ1bmN0aW9uIChwbGFjZXMpIHtcbiAgICBwbGFjZXMgPSBNYXRoLm1heChwbGFjZXMgfHwgMCwgMCk7XG4gICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLmNvbG9yLm1hcChyb3VuZFRvUGxhY2UocGxhY2VzKSkuY29uY2F0KHRoaXMudmFscGhhKSwgdGhpcy5tb2RlbCk7XG4gIH0sXG5cbiAgYWxwaGE6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLmNvbG9yLmNvbmNhdChNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB2YWwpKSksIHRoaXMubW9kZWwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZhbHBoYTtcbiAgfSxcblxuICAvLyByZ2JcbiAgcmVkOiBnZXRzZXQoXCJyZ2JcIiwgMCwgbWF4Zm4oMjU1KSksXG4gIGdyZWVuOiBnZXRzZXQoXCJyZ2JcIiwgMSwgbWF4Zm4oMjU1KSksXG4gIGJsdWU6IGdldHNldChcInJnYlwiLCAyLCBtYXhmbigyNTUpKSxcblxuICBodWU6IGdldHNldChbXCJoc2xcIiwgXCJoc3ZcIiwgXCJoc2xcIiwgXCJod2JcIiwgXCJoY2dcIl0sIDAsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gKCh2YWwgJSAzNjApICsgMzYwKSAlIDM2MDtcbiAgfSksIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYnJhY2Utc3R5bGVcblxuICBzYXR1cmF0aW9ubDogZ2V0c2V0KFwiaHNsXCIsIDEsIG1heGZuKDEwMCkpLFxuICBsaWdodG5lc3M6IGdldHNldChcImhzbFwiLCAyLCBtYXhmbigxMDApKSxcblxuICBzYXR1cmF0aW9udjogZ2V0c2V0KFwiaHN2XCIsIDEsIG1heGZuKDEwMCkpLFxuICB2YWx1ZTogZ2V0c2V0KFwiaHN2XCIsIDIsIG1heGZuKDEwMCkpLFxuXG4gIGNocm9tYTogZ2V0c2V0KFwiaGNnXCIsIDEsIG1heGZuKDEwMCkpLFxuICBncmF5OiBnZXRzZXQoXCJoY2dcIiwgMiwgbWF4Zm4oMTAwKSksXG5cbiAgd2hpdGU6IGdldHNldChcImh3YlwiLCAxLCBtYXhmbigxMDApKSxcbiAgd2JsYWNrOiBnZXRzZXQoXCJod2JcIiwgMiwgbWF4Zm4oMTAwKSksXG5cbiAgY3lhbjogZ2V0c2V0KFwiY215a1wiLCAwLCBtYXhmbigxMDApKSxcbiAgbWFnZW50YTogZ2V0c2V0KFwiY215a1wiLCAxLCBtYXhmbigxMDApKSxcbiAgeWVsbG93OiBnZXRzZXQoXCJjbXlrXCIsIDIsIG1heGZuKDEwMCkpLFxuICBibGFjazogZ2V0c2V0KFwiY215a1wiLCAzLCBtYXhmbigxMDApKSxcblxuICB4OiBnZXRzZXQoXCJ4eXpcIiwgMCwgbWF4Zm4oMTAwKSksXG4gIHk6IGdldHNldChcInh5elwiLCAxLCBtYXhmbigxMDApKSxcbiAgejogZ2V0c2V0KFwieHl6XCIsIDIsIG1heGZuKDEwMCkpLFxuXG4gIGw6IGdldHNldChcImxhYlwiLCAwLCBtYXhmbigxMDApKSxcbiAgYTogZ2V0c2V0KFwibGFiXCIsIDEpLFxuICBiOiBnZXRzZXQoXCJsYWJcIiwgMiksXG5cbiAga2V5d29yZDogZnVuY3Rpb24gKHZhbCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbmV3IENvbG9yKHZhbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnZlcnRbdGhpcy5tb2RlbF0ua2V5d29yZCh0aGlzLmNvbG9yKTtcbiAgfSxcblxuICBoZXg6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG5ldyBDb2xvcih2YWwpO1xuICAgIH1cblxuICAgIHJldHVybiBjb2xvclN0cmluZy50by5oZXgodGhpcy5yZ2IoKS5yb3VuZCgpLmNvbG9yKTtcbiAgfSxcblxuICByZ2JOdW1iZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcbiAgICByZXR1cm4gKChyZ2JbMF0gJiAweGZmKSA8PCAxNikgfCAoKHJnYlsxXSAmIDB4ZmYpIDw8IDgpIHwgKHJnYlsyXSAmIDB4ZmYpO1xuICB9LFxuXG4gIGx1bWlub3NpdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9XQ0FHMjAvI3JlbGF0aXZlbHVtaW5hbmNlZGVmXG4gICAgdmFyIHJnYiA9IHRoaXMucmdiKCkuY29sb3I7XG5cbiAgICB2YXIgbHVtID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjaGFuID0gcmdiW2ldIC8gMjU1O1xuICAgICAgbHVtW2ldID0gY2hhbiA8PSAwLjAzOTI4ID8gY2hhbiAvIDEyLjkyIDogTWF0aC5wb3coKGNoYW4gKyAwLjA1NSkgLyAxLjA1NSwgMi40KTtcbiAgICB9XG5cbiAgICByZXR1cm4gMC4yMTI2ICogbHVtWzBdICsgMC43MTUyICogbHVtWzFdICsgMC4wNzIyICogbHVtWzJdO1xuICB9LFxuXG4gIGNvbnRyYXN0OiBmdW5jdGlvbiAoY29sb3IyKSB7XG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNjb250cmFzdC1yYXRpb2RlZlxuICAgIHZhciBsdW0xID0gdGhpcy5sdW1pbm9zaXR5KCk7XG4gICAgdmFyIGx1bTIgPSBjb2xvcjIubHVtaW5vc2l0eSgpO1xuXG4gICAgaWYgKGx1bTEgPiBsdW0yKSB7XG4gICAgICByZXR1cm4gKGx1bTEgKyAwLjA1KSAvIChsdW0yICsgMC4wNSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChsdW0yICsgMC4wNSkgLyAobHVtMSArIDAuMDUpO1xuICB9LFxuXG4gIGxldmVsOiBmdW5jdGlvbiAoY29sb3IyKSB7XG4gICAgdmFyIGNvbnRyYXN0UmF0aW8gPSB0aGlzLmNvbnRyYXN0KGNvbG9yMik7XG4gICAgaWYgKGNvbnRyYXN0UmF0aW8gPj0gNy4xKSB7XG4gICAgICByZXR1cm4gXCJBQUFcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udHJhc3RSYXRpbyA+PSA0LjUgPyBcIkFBXCIgOiBcIlwiO1xuICB9LFxuXG4gIGlzRGFyazogZnVuY3Rpb24gKCkge1xuICAgIC8vIFlJUSBlcXVhdGlvbiBmcm9tIGh0dHA6Ly8yNHdheXMub3JnLzIwMTAvY2FsY3VsYXRpbmctY29sb3ItY29udHJhc3RcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcbiAgICB2YXIgeWlxID0gKHJnYlswXSAqIDI5OSArIHJnYlsxXSAqIDU4NyArIHJnYlsyXSAqIDExNCkgLyAxMDAwO1xuICAgIHJldHVybiB5aXEgPCAxMjg7XG4gIH0sXG5cbiAgaXNMaWdodDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RhcmsoKTtcbiAgfSxcblxuICBuZWdhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgcmdiLmNvbG9yW2ldID0gMjU1IC0gcmdiLmNvbG9yW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmdiO1xuICB9LFxuXG4gIGxpZ2h0ZW46IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIGhzbC5jb2xvclsyXSArPSBoc2wuY29sb3JbMl0gKiByYXRpbztcbiAgICByZXR1cm4gaHNsO1xuICB9LFxuXG4gIGRhcmtlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG4gICAgdmFyIGhzbCA9IHRoaXMuaHNsKCk7XG4gICAgaHNsLmNvbG9yWzJdIC09IGhzbC5jb2xvclsyXSAqIHJhdGlvO1xuICAgIHJldHVybiBoc2w7XG4gIH0sXG5cbiAgc2F0dXJhdGU6IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIGhzbC5jb2xvclsxXSArPSBoc2wuY29sb3JbMV0gKiByYXRpbztcbiAgICByZXR1cm4gaHNsO1xuICB9LFxuXG4gIGRlc2F0dXJhdGU6IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIGhzbC5jb2xvclsxXSAtPSBoc2wuY29sb3JbMV0gKiByYXRpbztcbiAgICByZXR1cm4gaHNsO1xuICB9LFxuXG4gIHdoaXRlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG4gICAgdmFyIGh3YiA9IHRoaXMuaHdiKCk7XG4gICAgaHdiLmNvbG9yWzFdICs9IGh3Yi5jb2xvclsxXSAqIHJhdGlvO1xuICAgIHJldHVybiBod2I7XG4gIH0sXG5cbiAgYmxhY2tlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG4gICAgdmFyIGh3YiA9IHRoaXMuaHdiKCk7XG4gICAgaHdiLmNvbG9yWzJdICs9IGh3Yi5jb2xvclsyXSAqIHJhdGlvO1xuICAgIHJldHVybiBod2I7XG4gIH0sXG5cbiAgZ3JheXNjYWxlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmF5c2NhbGUjQ29udmVydGluZ19jb2xvcl90b19ncmF5c2NhbGVcbiAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcbiAgICB2YXIgdmFsID0gcmdiWzBdICogMC4zICsgcmdiWzFdICogMC41OSArIHJnYlsyXSAqIDAuMTE7XG4gICAgcmV0dXJuIENvbG9yLnJnYih2YWwsIHZhbCwgdmFsKTtcbiAgfSxcblxuICBmYWRlOiBmdW5jdGlvbiAocmF0aW8pIHtcbiAgICByZXR1cm4gdGhpcy5hbHBoYSh0aGlzLnZhbHBoYSAtIHRoaXMudmFscGhhICogcmF0aW8pO1xuICB9LFxuXG4gIG9wYXF1ZXI6IGZ1bmN0aW9uIChyYXRpbykge1xuICAgIHJldHVybiB0aGlzLmFscGhhKHRoaXMudmFscGhhICsgdGhpcy52YWxwaGEgKiByYXRpbyk7XG4gIH0sXG5cbiAgcm90YXRlOiBmdW5jdGlvbiAoZGVncmVlcykge1xuICAgIHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuICAgIHZhciBodWUgPSBoc2wuY29sb3JbMF07XG4gICAgaHVlID0gKGh1ZSArIGRlZ3JlZXMpICUgMzYwO1xuICAgIGh1ZSA9IGh1ZSA8IDAgPyAzNjAgKyBodWUgOiBodWU7XG4gICAgaHNsLmNvbG9yWzBdID0gaHVlO1xuICAgIHJldHVybiBoc2w7XG4gIH0sXG5cbiAgbWl4OiBmdW5jdGlvbiAobWl4aW5Db2xvciwgd2VpZ2h0KSB7XG4gICAgLy8gcG9ydGVkIGZyb20gc2FzcyBpbXBsZW1lbnRhdGlvbiBpbiBDXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Nhc3MvbGlic2Fzcy9ibG9iLzBlNmI0YTI4NTAwOTIzNTZhYTNlY2UwN2M2YjI0OWYwMjIxY2FjZWQvZnVuY3Rpb25zLmNwcCNMMjA5XG4gICAgaWYgKCFtaXhpbkNvbG9yIHx8ICFtaXhpbkNvbG9yLnJnYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcmd1bWVudCB0byBcIm1peFwiIHdhcyBub3QgYSBDb2xvciBpbnN0YW5jZSwgYnV0IHJhdGhlciBhbiBpbnN0YW5jZSBvZiAnICsgdHlwZW9mIG1peGluQ29sb3IpO1xuICAgIH1cbiAgICB2YXIgY29sb3IxID0gbWl4aW5Db2xvci5yZ2IoKTtcbiAgICB2YXIgY29sb3IyID0gdGhpcy5yZ2IoKTtcbiAgICB2YXIgcCA9IHdlaWdodCA9PT0gdW5kZWZpbmVkID8gMC41IDogd2VpZ2h0O1xuXG4gICAgdmFyIHcgPSAyICogcCAtIDE7XG4gICAgdmFyIGEgPSBjb2xvcjEuYWxwaGEoKSAtIGNvbG9yMi5hbHBoYSgpO1xuXG4gICAgdmFyIHcxID0gKCh3ICogYSA9PT0gLTEgPyB3IDogKHcgKyBhKSAvICgxICsgdyAqIGEpKSArIDEpIC8gMi4wO1xuICAgIHZhciB3MiA9IDEgLSB3MTtcblxuICAgIHJldHVybiBDb2xvci5yZ2IoXG4gICAgICB3MSAqIGNvbG9yMS5yZWQoKSArIHcyICogY29sb3IyLnJlZCgpLFxuICAgICAgdzEgKiBjb2xvcjEuZ3JlZW4oKSArIHcyICogY29sb3IyLmdyZWVuKCksXG4gICAgICB3MSAqIGNvbG9yMS5ibHVlKCkgKyB3MiAqIGNvbG9yMi5ibHVlKCksXG4gICAgICBjb2xvcjEuYWxwaGEoKSAqIHAgKyBjb2xvcjIuYWxwaGEoKSAqICgxIC0gcClcbiAgICApO1xuICB9LFxufTtcblxuLy8gbW9kZWwgY29udmVyc2lvbiBtZXRob2RzIGFuZCBzdGF0aWMgY29uc3RydWN0b3JzXG5PYmplY3Qua2V5cyhjb252ZXJ0KS5mb3JFYWNoKGZ1bmN0aW9uIChtb2RlbCkge1xuICBpZiAoc2tpcHBlZE1vZGVscy5pbmRleE9mKG1vZGVsKSAhPT0gLTEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY2hhbm5lbHMgPSBjb252ZXJ0W21vZGVsXS5jaGFubmVscztcblxuICAvLyBjb252ZXJzaW9uIG1ldGhvZHNcbiAgQ29sb3IucHJvdG90eXBlW21vZGVsXSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5tb2RlbCA9PT0gbW9kZWwpIHtcbiAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBuZXcgQ29sb3IoYXJndW1lbnRzLCBtb2RlbCk7XG4gICAgfVxuXG4gICAgdmFyIG5ld0FscGhhID0gdHlwZW9mIGFyZ3VtZW50c1tjaGFubmVsc10gPT09IFwibnVtYmVyXCIgPyBjaGFubmVscyA6IHRoaXMudmFscGhhO1xuICAgIHJldHVybiBuZXcgQ29sb3IoYXNzZXJ0QXJyYXkoY29udmVydFt0aGlzLm1vZGVsXVttb2RlbF0ucmF3KHRoaXMuY29sb3IpKS5jb25jYXQobmV3QWxwaGEpLCBtb2RlbCk7XG4gIH07XG5cbiAgLy8gJ3N0YXRpYycgY29uc3RydWN0aW9uIG1ldGhvZHNcbiAgQ29sb3JbbW9kZWxdID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgY29sb3IgPSB6ZXJvQXJyYXkoX3NsaWNlLmNhbGwoYXJndW1lbnRzKSwgY2hhbm5lbHMpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbG9yKGNvbG9yLCBtb2RlbCk7XG4gIH07XG59KTtcblxuZnVuY3Rpb24gcm91bmRUbyhudW0sIHBsYWNlcykge1xuICByZXR1cm4gTnVtYmVyKG51bS50b0ZpeGVkKHBsYWNlcykpO1xufVxuXG5mdW5jdGlvbiByb3VuZFRvUGxhY2UocGxhY2VzKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobnVtKSB7XG4gICAgcmV0dXJuIHJvdW5kVG8obnVtLCBwbGFjZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRzZXQobW9kZWwsIGNoYW5uZWwsIG1vZGlmaWVyKSB7XG4gIG1vZGVsID0gQXJyYXkuaXNBcnJheShtb2RlbCkgPyBtb2RlbCA6IFttb2RlbF07XG5cbiAgbW9kZWwuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgIChsaW1pdGVyc1ttXSB8fCAobGltaXRlcnNbbV0gPSBbXSkpW2NoYW5uZWxdID0gbW9kaWZpZXI7XG4gIH0pO1xuXG4gIG1vZGVsID0gbW9kZWxbMF07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGlmIChtb2RpZmllcikge1xuICAgICAgICB2YWwgPSBtb2RpZmllcih2YWwpO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQgPSB0aGlzW21vZGVsXSgpO1xuICAgICAgcmVzdWx0LmNvbG9yW2NoYW5uZWxdID0gdmFsO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQgPSB0aGlzW21vZGVsXSgpLmNvbG9yW2NoYW5uZWxdO1xuICAgIGlmIChtb2RpZmllcikge1xuICAgICAgcmVzdWx0ID0gbW9kaWZpZXIocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBtYXhmbihtYXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKG1heCwgdikpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhc3NlcnRBcnJheSh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbCA6IFt2YWxdO1xufVxuXG5mdW5jdGlvbiB6ZXJvQXJyYXkoYXJyLCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgYXJyW2ldICE9PSBcIm51bWJlclwiKSB7XG4gICAgICBhcnJbaV0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3I7XG4iLCI8c2NyaXB0PlxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgc2NhbGUgY3NzIHZhcmlhYmxlcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtcIm1lZGl1bVwiIHwgXCJsYXJnZVwifSBbc3BlY3RydW1TY2FsZT1cIm1lZGl1bVwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBzcGVjdHJ1bVNjYWxlID0gXCJtZWRpdW1cIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgdGhlbWUgY3NzIHZhcmlhYmxlcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtcImRhcmtcIiB8IFwiZGFya2VzdFwiIHwgXCJsaWdodFwiIHwgXCJsaWdodGVzdFwifSBbc3BlY3RydW1UaGVtZT1cImxpZ2h0XCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHNwZWN0cnVtVGhlbWUgPSBcImRhcmtcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcmVzZXQgY3NzIHZhcmlhYmxlcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtbe1wiLS1jc3MtdmFyaWFibGUtbmFtZVwiOlwidmFyaWFibGUtdmFsdWVcIn1dIHwgW119IFtyZXNldENzcz0gW11dXG4gICAqL1xuICBleHBvcnQgbGV0IHJlc2V0Q3NzID0gW107XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHJlc2V0IGNzcyBvZiBwYWdlXG4gICAqIEB0eXBlIHtzdHJpbmd9IFtyZXNldENzcz0gW11dXVxuICAgKi9cbiAgZXhwb3J0IGxldCByZXNldENzc1RleHQgPSBcIlwiO1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgdGhlbWUgY29sb3Igb2YgbWF0ZSBlbGVtZW50XG4gICAqIElmIGl0IGlzIG5vdCBzZXQsIHRoZSBwYWdlIHRoZW1lIGNvbG9yIGlzIGF1dG9tYXRpY2FsbHkgb2J0YWluZWRcbiAgICogQHR5cGUge3N0cmluZ30gW3RoZW1lQ29sb3I9IHVuZGVmaW5lZF1dXG4gICAqL1xuICBleHBvcnQgbGV0IHRoZW1lQ29sb3IgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGxhbmd1YWdlIG9mIHBhZ2VcbiAgICogQHR5cGUge3N0cmluZzpJU08gNjM5LTF9IFtsYW5ndWFnZT1cImVuXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGxhbmd1YWdlID0gXCJlblwiO1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGRpciBhdHRyaWJ1dGUgZm9yIGNvbXBvbmVudHMgdG8gcmVuZGVyIGNvcnJlY3RseVxuICAgKiBsdHI6IGxlZnQtdG8tcmlnaHRcbiAgICogcnRsOiByaWdodC10by1sZWZ0XG4gICAqIEB0eXBlIHtcImx0clwiIHwgXCJydGxcIn0gW2xhbmd1YWdlUmVhZGluZ09yZGVyPVwibHRyXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGxhbmd1YWdlUmVhZGluZ09yZGVyID0gXCJsdHJcIjtcblxuICBpbXBvcnQgeyBvbk1vdW50LCBiZWZvcmVVcGRhdGUsIGFmdGVyVXBkYXRlIH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG4gIGxldCB0aGVtZUJnQ29sb3IgPSBcIiNjY2NjY2NcIjtcblxuICBvbk1vdW50KCgpID0+IHtcbiAgICBzZXREb2N1bWVudEVsZW1lbnRQcm9wZXJ0eSgpO1xuICAgIHJlc2V0Q3NzQ29udGVudChyZXNldENzc1RleHQpO1xuICB9KTtcblxuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaW1wb3J0KFwiLi4vdXRpbHMvZm9jdXMtcmluZy1wb2x5ZmlsbFwiKTtcbiAgfSk7XG5cbiAgYmVmb3JlVXBkYXRlKCgpID0+IHtcbiAgICBzZXREb2N1bWVudEVsZW1lbnRQcm9wZXJ0eSgpO1xuICAgIHJlc2V0Q3NzVmFyaWFibGVzKHJlc2V0Q3NzKTtcbiAgICBnZXRUaGVtZUJnQ29sb3IoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2V0RG9jdW1lbnRFbGVtZW50UHJvcGVydHkoKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTmFtZSA9IGBzcGVjdHJ1bSBzcGVjdHJ1bS0tJHtzcGVjdHJ1bVNjYWxlfSBzcGVjdHJ1bS0tJHtzcGVjdHJ1bVRoZW1lfWA7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgPSBsYW5ndWFnZTtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZGlyID0gbGFuZ3VhZ2VSZWFkaW5nT3JkZXI7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldENzc1ZhcmlhYmxlcyhhcnJheSkge1xuICAgIGlmICghYXJyYXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNzc1ZhcmlhYmxlc05hbWU7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3NzVmFyaWFibGVzTmFtZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFycmF5W2luZGV4XSk7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoY3NzVmFyaWFibGVzTmFtZSwgYXJyYXlbaW5kZXhdW2Nzc1ZhcmlhYmxlc05hbWVdKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVzZXRDc3NDb250ZW50KGNvbnRlbnRUZXh0KSB7XG4gICAgaWYgKCFjb250ZW50VGV4dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgc2hlZXQuaW5uZXJIVE1MID0gY29udGVudFRleHQ7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzaGVldCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VGhlbWVCZ0NvbG9yKCkge1xuICAgIHRoZW1lQmdDb2xvciA9IGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKFxuICAgICAgXCItLXNwZWN0cnVtLWFsaWFzLWJhY2tncm91bmQtY29sb3ItZGVmYXVsdFwiXG4gICAgKTtcbiAgfVxuPC9zY3JpcHQ+XG5cbjxzdmVsdGU6aGVhZD5cbiAgPG1ldGEgbmFtZT1cInRoZW1lLWNvbG9yXCIgY29udGVudD17dGhlbWVDb2xvciB8fCB0aGVtZUJnQ29sb3J9IC8+XG48L3N2ZWx0ZTpoZWFkPlxuPHNsb3QgLz5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGFmdGVyVXBkYXRlLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBnZXRSZWN0LCBnZXRJblRoZUJveFBvc2l0aW9uIH0gZnJvbSBcIi4uL3V0aWxzL2VsZW1lbnQuanNcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcm9sZSBvZiBtZW51XG4gICAqIEB0eXBlIHtzdHJpbmd9IFtyb2xlID0gXCJtZW51XCJdXG4gICAqL1xuICBleHBvcnQgbGV0IHJvbGUgPSBcIm1lbnVcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbWF4LXdpZHRoIG9mIG1lbnVcbiAgICogQHR5cGUge251bWJlcn0gW21heFdpZHRoID0gMF1cbiAgICovXG4gIGV4cG9ydCBsZXQgbWF4V2lkdGggPSAwO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBtaW4td2lkdGggb2YgbWVudVxuICAgKiBAdHlwZSB7bnVtYmVyfSBbbWluV2lkdGggPSAwXVxuICAgKi9cbiAgZXhwb3J0IGxldCBtaW5XaWR0aCA9IDA7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGFyaWEtbGFiZWxsZWRieSBvZiBtZW51XG4gICAqIEB0eXBlIHtzdHJpbmd9IFthcmlhTGFiZWxsZWRieSA9IFwiXCJdXG4gICAqL1xuICBleHBvcnQgbGV0IGFyaWFMYWJlbGxlZGJ5ID0gXCJcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbmVzdGVkIG1vZGUgb2YgbWVudVxuICAgKiBAdHlwZSB7Ym9vbGVhbn0gW25lc3RlZCA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBuZXN0ZWQgPSBmYWxzZTtcblxuICBsZXQgbWVudUVsO1xuICBsZXQgbWVudVdpZHRoO1xuICBhZnRlclVwZGF0ZSgoKSA9PiB7XG4gICAgaWYgKG1lbnVFbCkge1xuICAgICAgbmVzdGVkICYmIHJlc2V0UG9zaXRpb24oKTtcbiAgICAgIG1lbnVXaWR0aCA9IHNldFdpZHRoKCkud2lkdGg7XG4gICAgfVxuICB9KTtcbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgbmVzdGVkICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbGlzdGVuRm9yQ2hpbGRDbGlja3MpO1xuICB9KTtcblxuICBmdW5jdGlvbiBsaXN0ZW5Gb3JDaGlsZENsaWNrcyhlKSB7XG4gICAgbGV0IHByZXZOb2RlID0gbWVudUVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgaWYgKHByZXZOb2RlICYmIHByZXZOb2RlLmNvbnRhaW5zKGUudGFyZ2V0KSkge1xuICAgICAgbWVudUVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgJiYgcmVzZXRQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBnZXRJblRoZUJveFBvc2l0aW9uVG9wID0gMDtcbiAgbGV0IGdldEluVGhlQm94UG9zaXRpb25MZWZ0ID0gMDtcbiAgZnVuY3Rpb24gcmVzZXRQb3NpdGlvbigpIHtcbiAgICBsZXQgcHJldk5vZGUgPSBtZW51RWwucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBpZiAocHJldk5vZGUpIHtcbiAgICAgIGxldCBvcGVuSXRlbSA9IHByZXZOb2RlLnF1ZXJ5U2VsZWN0b3IoXCIuc3BlY3RydW0tTWVudS1pdGVtLmlzLW9wZW5cIik7XG4gICAgICBnZXRJblRoZUJveFBvc2l0aW9uTGVmdCA9IGdldFJlY3QocHJldk5vZGUpLndpZHRoO1xuICAgICAgWywgZ2V0SW5UaGVCb3hQb3NpdGlvblRvcF0gPSBnZXRJblRoZUJveFBvc2l0aW9uKHByZXZOb2RlLCBvcGVuSXRlbSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldFdpZHRoKCkge1xuICAgIGxldCB0aGlzTWVudSA9IG1lbnVFbC5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiNydWJ1cy1BY3Rpb25Tb3VyY2VcIik7XG4gICAgaWYgKHRoaXNNZW51KSB7XG4gICAgICByZXR1cm4gZ2V0UmVjdCh0aGlzTWVudSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IHdpZHRoOiAwIH07XG4gICAgfVxuICB9XG5cbiAgJDogc3R5bGVDc3NUZXh0ID0gW1xuICAgIG1heFdpZHRoID8gYG1heC13aWR0aDoke21heFdpZHRofXB4O2AgOiBgbWF4LXdpZHRoOiR7bWVudVdpZHRofXB4O2AsXG4gICAgbWluV2lkdGggPyBgbWluLXdpZHRoOiR7bWluV2lkdGh9cHg7YCA6IGBtaW4td2lkdGg6JHttZW51V2lkdGh9cHg7YCxcbiAgICBuZXN0ZWQgJiYgYHRvcDoke2dldEluVGhlQm94UG9zaXRpb25Ub3B9cHg7YCxcbiAgICBuZXN0ZWQgJiYgYGxlZnQ6JHtnZXRJblRoZUJveFBvc2l0aW9uTGVmdH1weDtgLFxuICBdXG4gICAgLmZpbHRlcihCb29sZWFuKVxuICAgIC5qb2luKFwiIFwiKTtcbjwvc2NyaXB0PlxuXG48c3R5bGUgZ2xvYmFsPlxuICAuc3BlY3RydW0tTWVudS1pdGVtTGFiZWwge1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgd2lkdGg6IGF1dG87XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICpkaXNwbGF5OiBpbmxpbmU7XG4gIH1cbiAgLnNwZWN0cnVtLU1lbnUge1xuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcbiAgfVxuICAuc3BlY3RydW0tTWVudS1uZXN0ZWQge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgfVxuPC9zdHlsZT5cblxuPHVsXG4gIGNsYXNzPVwic3BlY3RydW0tTWVudVwiXG4gIGNsYXNzOnNwZWN0cnVtLU1lbnUtbmVzdGVkPXtuZXN0ZWR9XG4gIHtyb2xlfVxuICBzdHlsZT17c3R5bGVDc3NUZXh0fVxuICBiaW5kOnRoaXM9e21lbnVFbH1cbiAgYXJpYS1sYWJlbGxlZGJ5PXthcmlhTGFiZWxsZWRieX0+XG4gIDxzbG90IC8+XG48L3VsPlxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0IHsgY3VycmVudF9jb21wb25lbnQgfSBmcm9tIFwic3ZlbHRlL2ludGVybmFsXCI7XG4gIGltcG9ydCB7IGdldEV2ZW50c0FjdGlvbiB9IGZyb20gXCIuLi91dGlscy9nZXQtZXZlbnRzLWFjdGlvbi5qc1wiO1xuICBpbXBvcnQgeyBJY29uQ2hlY2ttYXJrTWVkaXVtLCBJY29uQ2hldnJvblJpZ2h0TWVkaXVtIH0gZnJvbSBcIkBydWJ1cy9zdmVsdGUtc3BlY3RydW0taWNvbnMtdWlcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbGFiZWwgb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7c3RyaW5nfSBbbGFiZWwgPSBcIlwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCBsYWJlbCA9IFwiXCI7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHNlbGVjdGVkIHN0YXR1cyBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtib29sZWFufSBbaXNTZWxlY3RlZCA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc1NlbGVjdGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldCB0byBgdHJ1ZWAgdG8gZGlzYWJsZSB0aGUgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtib29sZWFufVtkaXNhYmxlZD1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZGl2aWRlciBzdGF0dXMgb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7Ym9vbGVhbn0gW2lzRGl2aWRlciA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc0RpdmlkZXIgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZmluYWxseSByZXN1bHQgaW5kZXggb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7bnVtYmVyfSBbcmVzdWx0SW5kZXggPSAwXVxuICAgKi9cbiAgZXhwb3J0IGxldCByZXN1bHRJbmRleCA9IDA7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIHRoaXMgaXRlbSBpbmRleCBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtudW1iZXJ9IFt0aGlzSW5kZXggPSAwXVxuICAgKi9cbiAgZXhwb3J0IGxldCB0aGlzSW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSB0YWJpbmRleCBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtudW1iZXJ9IFt0YWJpbmRleCA9IDBdXG4gICAqL1xuICBleHBvcnQgbGV0IHRhYmluZGV4ID0gMDtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcm9sZSBvZiAgbWVudSBpdGVtXG4gICAqIEB0eXBlIHtzdHJpbmd9IFtyb2xlID0gXCJtZW51aXRlbVwiXVxuICAgKi9cbiAgZXhwb3J0IGxldCByb2xlID0gXCJtZW51aXRlbVwiO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGRpc3BsYXkgQ2hlY2ttYXJrIGljb25cbiAgICogQHR5cGUge251bWJlcn0gW3Nob3dDaGVja21hcmsgPSB0cnVlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBzaG93Q2hlY2ttYXJrID0gdHJ1ZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbmVzdGVkIG1vZGUgb2YgIG1lbnUgaXRlbVxuICAgKiBAdHlwZSB7Ym9vbGVhbn0gW25lc3RlZCA9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBuZXN0ZWQgPSBmYWxzZTtcblxuICBjb25zdCBldmVudHNMaXN0ZW4gPSBnZXRFdmVudHNBY3Rpb24oY3VycmVudF9jb21wb25lbnQpO1xuICBmdW5jdGlvbiBkcm9wZG93blBpY2soKSB7XG4gICAgcmVzdWx0SW5kZXggPSB0aGlzSW5kZXg7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGUgZ2xvYmFsPlxuICAuc3BlY3RydW0tTWVudS1pdGVtIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgfVxuICAuc3BlY3RydW0tTWVudS1pdGVtSWNvbiB7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuXG4gICAgcmlnaHQ6IDA7XG4gIH1cbiAgLnNwZWN0cnVtLU1lbnUtaXRlbS5pcy1kaXNhYmxlZCB7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIH1cbjwvc3R5bGU+XG5cbnsjaWYgaXNEaXZpZGVyfVxuICA8bGkgY2xhc3M9XCJzcGVjdHJ1bS1NZW51LWRpdmlkZXJcIiByb2xlPVwic2VwYXJhdG9yXCIgLz5cbns6ZWxzZX1cbiAgPGxpXG4gICAgY2xhc3M9XCJzcGVjdHJ1bS1NZW51LWl0ZW1cIlxuICAgIGNsYXNzOmlzLXNlbGVjdGVkPXshbmVzdGVkICYmIChpc1NlbGVjdGVkIHx8IHJlc3VsdEluZGV4ID09PSB0aGlzSW5kZXgpfVxuICAgIGNsYXNzOmlzLWRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICBjbGFzczppcy1vcGVuPXtuZXN0ZWQgJiYgKGlzU2VsZWN0ZWQgfHwgcmVzdWx0SW5kZXggPT09IHRoaXNJbmRleCl9XG4gICAge3JvbGV9XG4gICAge3RhYmluZGV4fVxuICAgIG9uOmNsaWNrPXshZGlzYWJsZWQgJiYgZHJvcGRvd25QaWNrfVxuICAgIHVzZTpldmVudHNMaXN0ZW4+XG4gICAgPHNsb3Q+PHNwYW4gY2xhc3M9XCJzcGVjdHJ1bS1NZW51LWl0ZW1MYWJlbFwiPntsYWJlbH08L3NwYW4+PC9zbG90PlxuICAgIHsjaWYgbmVzdGVkICYmIChpc1NlbGVjdGVkIHx8IHJlc3VsdEluZGV4ID09PSB0aGlzSW5kZXgpfVxuICAgICAgPEljb25DaGV2cm9uUmlnaHRNZWRpdW1cbiAgICAgICAgY2xhc3NOYW1lPVwic3BlY3RydW0tVUlJY29uLUNoZXZyb25SaWdodE1lZGl1bSBzcGVjdHJ1bS1NZW51LWNoZXZyb24gc3BlY3RydW0tTWVudS1pdGVtSWNvblwiXG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgd2lkdGg9XCI2XCJcbiAgICAgICAgaGVpZ2h0PVwiMTBcIlxuICAgICAgICBhcmlhLWhpZGRlbj17aXNTZWxlY3RlZH1cbiAgICAgICAgYXJpYS1sYWJlbD1cIk5leHRcIiAvPlxuICAgIHs6ZWxzZSBpZiBzaG93Q2hlY2ttYXJrfVxuICAgICAgPEljb25DaGVja21hcmtNZWRpdW1cbiAgICAgICAgY2xhc3NOYW1lPVwic3BlY3RydW0tTWVudS1jaGVja21hcmsgc3BlY3RydW0tTWVudS1pdGVtSWNvblwiXG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgd2lkdGg9XCIxMlwiXG4gICAgICAgIGhlaWdodD1cIjEyXCJcbiAgICAgICAgYXJpYS1oaWRkZW49e2lzU2VsZWN0ZWR9IC8+XG4gICAgey9pZn1cbiAgPC9saT5cbnsvaWZ9XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBJY29uQ2hldnJvbkRvd25NZWRpdW0sIEljb25BbGVydE1lZGl1bSB9IGZyb20gXCJAcnVidXMvc3ZlbHRlLXNwZWN0cnVtLWljb25zLXVpXCI7XG4gIGltcG9ydCB7IFBvcG92ZXIgfSBmcm9tIFwiLi4vUG9wb3ZlclwiO1xuICBpbXBvcnQgeyBNZW51IH0gZnJvbSBcIi4uL01lbnVcIjtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcGxhY2Vob2xkZXIgb2YgZHJvcGRvd25cbiAgICogQHR5cGUge3N0cmluZ30gW3BsYWNlaG9sZGVyID0gXCJcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgcGxhY2Vob2xkZXIgPSBcIlwiO1xuXG4gIC8qKlxuICAgKiBTZXQgdG8gYHRydWVgIHRvIGRpc2FibGUgdGhlIGRyb3Bkb3duXG4gICAqIEB0eXBlIHtib29sZWFufVtkaXNhYmxlZD1mYWxzZV1cbiAgICovXG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgZHJvcGRvd24gaXMgb3BlblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1baXNPcGVuPWZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc09wZW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogU2V0IGl0cyBleHRlcm5hbCByZXN1bHQgaW5kZXhcbiAgICogQHR5cGUgeyBudW1iZXIgfSBbcmVzdWx0SW5kZXggPSAwXG4gICAqL1xuICBleHBvcnQgbGV0IHJlc3VsdEluZGV4ID0gMDtcblxuICAvKipcbiAgICogU2V0IGl0cyBjdXJyZW50IGluZGV4XG4gICAqIEB0eXBlIHsgbnVtYmVyIH0gW3RoaXNJbmRleCA9IDBcbiAgICovXG4gIGV4cG9ydCBsZXQgdGhpc0luZGV4ID0gMDtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgaW52YWxpZCBtb2RlIG9mIGRyb3Bkb3duXG4gICAqIEB0eXBlIHsgYm9vbGVhbiB9IFtpc0ludmFsaWQ9IGZhbHNlXVxuICAgKi9cbiAgZXhwb3J0IGxldCBpc0ludmFsaWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgcXVpZXQgbW9kZSBvZiBkcm9wZG93blxuICAgKiBAdHlwZSB7IGJvb2xlYW4gfSBbaXNRdWlldD0gZmFsc2VdXG4gICAqL1xuICBleHBvcnQgbGV0IGlzUXVpZXQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgY3NzIGBtaW4td2lkdGhgIG9mIGRyb3Bkb3duIGFuZCBjaGlsZCBtZW51XG4gICAqIEB0eXBlIHsgbnVtYmVyIH0gW21pbldpZHRoID0gXCIyMDBcIl1cbiAgICovXG4gIGV4cG9ydCBsZXQgbWluV2lkdGggPSAyMDA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gYXV0b21hdGljYWxseSBmb2xkXG4gICAqIEB0eXBlIHtib29sZWFufVthdXRvRm9sZD1mYWxzZV1cbiAgICovXG5cbiAgZXhwb3J0IGxldCBhdXRvRm9sZCA9IHRydWU7XG5cbiAgbGV0IGlzQWN0aXZlID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRyb3Bkb3duU3RhdHVzQ3V0b3ZlcigpIHtcbiAgICBpc0FjdGl2ZSA9IHRydWU7XG4gICAgcmVzdWx0SW5kZXggPSB0aGlzSW5kZXg7XG4gICAgaXNPcGVuID0gIWlzT3BlbjtcbiAgfVxuICBvbk1vdW50KCgpID0+IHtcbiAgICBkcm9wbWVudUVsICYmIGRyb3BtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGxpc3RlbkZvckNoaWxkQ2xpY2tzKTtcbiAgICBkcm9wbWVudUVsICYmIGRyb3BtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGxpc3RlbkZvckNoaWxkQ2xpY2tzKTtcbiAgICB3aW5kb3cgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsaXN0ZW5Gb3JPdGhlckNsaWNrcyk7XG4gICAgd2luZG93ICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgbGlzdGVuRm9yT3RoZXJDbGlja3MpO1xuICB9KTtcblxuICBsZXQgZHJvcG1lbnVFbDtcbiAgbGV0IHRyaWdnZXJOb2RlID0gXCJcIjtcbiAgZnVuY3Rpb24gbGlzdGVuRm9yQ2hpbGRDbGlja3MoZSkge1xuICAgIGlmIChkcm9wbWVudUVsICYmIGRyb3BtZW51RWwuY29udGFpbnMoZS50YXJnZXQpKSB7XG4gICAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0Lmxlbmd0aCkge1xuICAgICAgICBpZiAodGVzdEhhc0NsYXNzTmFtZShlLnRhcmdldC5jbGFzc0xpc3QsIGBzcGVjdHJ1bS1NZW51LWl0ZW1gKSkge1xuICAgICAgICAgIHRyaWdnZXJOb2RlID0gZ2V0Tm9kZUhUTUwoZS50YXJnZXQuY2hpbGROb2Rlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVzdEhhc0NsYXNzTmFtZShlLnRhcmdldC5jbGFzc0xpc3QsIGBzcGVjdHJ1bS1NZW51LWl0ZW1MYWJlbGApKSB7XG4gICAgICAgICAgdHJpZ2dlck5vZGUgPSBnZXROb2RlSFRNTChlLnRhcmdldC5wYXJlbnROb2RlLmNoaWxkTm9kZXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHRlc3RIYXNDbGFzc05hbWUoZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc0xpc3QsIGBzcGVjdHJ1bS1NZW51LWl0ZW1gKSkge1xuICAgICAgICAgIHRyaWdnZXJOb2RlID0gZ2V0Tm9kZUhUTUwoZS50YXJnZXQucGFyZW50Tm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBsaXN0ZW5Gb3JPdGhlckNsaWNrcyhlKSB7XG4gICAgaWYgKCFhdXRvRm9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZHJvcG1lbnVFbCAmJiAhZHJvcG1lbnVFbC5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgIGlzT3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRlc3RIYXNDbGFzc05hbWUoZWwsIHZlcmlmeVN0cmluZykge1xuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGVsLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmV0dXJuIGVsW2luZGV4XSA9PT0gdmVyaWZ5U3RyaW5nO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBnZXROb2RlSFRNTChlbCkge1xuICAgIGlmICghZWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgbGV0IG5vZGVIVE1MID0gXCJcIjtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWwubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBpZiAoIXRlc3RIYXNDbGFzc05hbWUoZWxbaW5kZXhdLmNsYXNzTGlzdCwgYHNwZWN0cnVtLU1lbnUtY2hlY2ttYXJrYCkpIHtcbiAgICAgICAgZWxbaW5kZXhdLm91dGVySFRNTCA/IChub2RlSFRNTCA9IG5vZGVIVE1MICsgZWxbaW5kZXhdLm91dGVySFRNTCkgOiBub2RlSFRNTDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVIVE1MLnJlcGxhY2UoL3NwZWN0cnVtLU1lbnUtaXRlbUxhYmVsL2csIFwic3BlY3RydW0tRHJvcGRvd24tbGFiZWxcIik7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGUgZ2xvYmFsPlxuICAuc3BlY3RydW0tRmllbGRCdXR0b24ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gIH1cbiAgLnNwZWN0cnVtLURyb3Bkb3duLXRyaWdnZXIgPiAuc3BlY3RydW0tRHJvcGRvd24taWNvbiB7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIHZhcigtLXNwZWN0cnVtLWdsb2JhbC1hbmltYXRpb24tZHVyYXRpb24tMTAwLCAxMzBtcykgZWFzZS1pbi1vdXQsXG4gICAgICBvcGFjaXR5IHZhcigtLXNwZWN0cnVtLWdsb2JhbC1hbmltYXRpb24tZHVyYXRpb24tMTAwLCAxMzBtcykgZWFzZS1pbi1vdXQsXG4gICAgICB2aXNpYmlsaXR5IDBtcyBsaW5lYXIgdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWFuaW1hdGlvbi1kdXJhdGlvbi0xMDAsIDEzMG1zKTtcbiAgfVxuICAuc3BlY3RydW0tRHJvcGRvd24tdHJpZ2dlci5pcy1zZWxlY3RlZCA+IC5zcGVjdHJ1bS1Ecm9wZG93bi1pY29uIHtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpO1xuICB9XG48L3N0eWxlPlxuXG48ZGl2XG4gIGNsYXNzPVwic3BlY3RydW0tRHJvcGRvd25cIlxuICBjbGFzczppcy1vcGVuPXtpc09wZW59XG4gIGNsYXNzOmlzLWludmFsaWQ9e2lzSW52YWxpZH1cbiAgY2xhc3M6aXMtZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICBjbGFzczpzcGVjdHJ1bS1Ecm9wZG93bi0tcXVpZXQ9e2lzUXVpZXR9XG4gIG9uOmNsaWNrPXshZGlzYWJsZWQgJiYgZHJvcGRvd25TdGF0dXNDdXRvdmVyfVxuICBiaW5kOnRoaXM9e2Ryb3BtZW51RWx9PlxuICA8YnV0dG9uXG4gICAgY2xhc3M9XCJzcGVjdHJ1bS1GaWVsZEJ1dHRvbiBzcGVjdHJ1bS1Ecm9wZG93bi10cmlnZ2VyXCJcbiAgICBjbGFzczppcy1zZWxlY3RlZD17aXNPcGVufVxuICAgIGNsYXNzOmlzLWludmFsaWQ9e2lzSW52YWxpZH1cbiAgICBjbGFzczppcy1kaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgY2xhc3M6c3BlY3RydW0tRmllbGRCdXR0b24tLXF1aWV0PXtpc1F1aWV0fVxuICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICBpZD1cInJ1YnVzLUFjdGlvblNvdXJjZVwiXG4gICAgc3R5bGU9XCJtaW4td2lkdGg6e21pbldpZHRofXB4XCI+XG4gICAgeyNpZiAhdHJpZ2dlck5vZGV9XG4gICAgICA8c3BhbiBjbGFzcz1cInNwZWN0cnVtLURyb3Bkb3duLWxhYmVsXCIgY2xhc3M6aXMtcGxhY2Vob2xkZXI9eyFpc0FjdGl2ZSAmJiBwbGFjZWhvbGRlcn0+XG4gICAgICAgIDxzbG90IG5hbWU9XCJkcm9wZG93bi1sYWJlbFwiPntwbGFjZWhvbGRlcn08L3Nsb3Q+XG4gICAgICA8L3NwYW4+XG4gICAgezplbHNlfVxuICAgICAge0BodG1sIHRyaWdnZXJOb2RlfVxuICAgIHsvaWZ9XG4gICAgeyNpZiBpc0ludmFsaWR9XG4gICAgICA8SWNvbkFsZXJ0TWVkaXVtIGZvY3VzYWJsZT1cImZhbHNlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgYXJpYS1sYWJlbD1cIkZvbGRlclwiIC8+XG4gICAgey9pZn1cbiAgICA8SWNvbkNoZXZyb25Eb3duTWVkaXVtIGNsYXNzTmFtZT1cInNwZWN0cnVtLURyb3Bkb3duLWljb25cIiBmb2N1c2FibGU9XCJmYWxzZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gIDwvYnV0dG9uPlxuXG4gIDxQb3BvdmVyIGNsYXNzPVwic3BlY3RydW0tRHJvcGRvd24tcG9wb3ZlclwiIHtpc09wZW59PlxuICAgIDxNZW51IHJvbGU9XCJsaXN0Ym94XCIge21pbldpZHRofT5cbiAgICAgIDxzbG90IC8+XG4gICAgPC9NZW51PlxuICA8L1BvcG92ZXI+XG4gIDxkaXYgLz5cbjwvZGl2PlxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0ICogYXMgcm91dGVyIGZyb20gXCIuL25hdi5qc29uXCI7XG4gIGltcG9ydCB7IEJ1dHRvbiwgQWN0aW9uR3JvdXAgfSBmcm9tIFwiQHJ1YnVzL3J1YnVzL3NyY1wiO1xuICBpbXBvcnQgeyBEcm9wZG93biB9IGZyb20gXCJAcnVidXMvcnVidXMvc3JjL3BhY2thZ2VzL0Ryb3Bkb3duXCI7XG4gIGltcG9ydCB7IE1lbnVJdGVtIH0gZnJvbSBcIkBydWJ1cy9ydWJ1cy9zcmMvcGFja2FnZXMvTWVudVwiO1xuICBpbXBvcnQgeyBhZnRlclVwZGF0ZSwgYmVmb3JlVXBkYXRlLCBnZXRDb250ZXh0LCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG4gIGV4cG9ydCBsZXQgc2VnbWVudCA9IFwiXCI7XG5cbiAgbGV0IHJ1YnVzRG9jQ29uZmlnID0gZ2V0Q29udGV4dChcInJ1YnVzRG9jQ29uZmlnXCIpO1xuICBsZXQgdGhlbWVMaXN0ID0gW1wibGlnaHRcIiwgXCJsaWdodGVzdFwiLCBcImRhcmtcIiwgXCJkYXJrZXN0XCJdO1xuICBsZXQgbGFuZ3VhZ2VMaXN0ID0gW1xuICAgIHsgbmFtZTogXCLkuK3mlodcIiwgY29kZTogXCJ6aFwiIH0sXG4gICAgeyBuYW1lOiBcIkVuZ2xpc2hcIiwgY29kZTogXCJlblwiIH0sXG4gIF07XG5cbiAgbGV0IHJlc3VsdExhbmd1YWdlSW5kZXggPSAwO1xuICBsZXQgcmVzdWx0VGhlbWVJbmRleCA9IDA7XG5cbiAgZnVuY3Rpb24gc3dpdGNoVGhlbWUodCkge1xuICAgICRydWJ1c0RvY0NvbmZpZy50aGVtZSA9IHQ7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwicnVidXMtbG9jYWwtY29uZmlnLXRoZW1lXCIsIHQpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3dpdGNoTGFuZ3VhZ2UobCkge1xuICAgICRydWJ1c0RvY0NvbmZpZy5sYW5nID0gbDtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJydWJ1cy1sb2NhbC1jb25maWctbGFuZ1wiLCBsKTtcbiAgfVxuXG4gIGJlZm9yZVVwZGF0ZSgoKSA9PiB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoZW1lTGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGlmICh0aGVtZUxpc3RbaW5kZXhdID09PSAkcnVidXNEb2NDb25maWcudGhlbWUpIHtcbiAgICAgICAgcmVzdWx0VGhlbWVJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGFuZ3VhZ2VMaXN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgaWYgKGxhbmd1YWdlTGlzdFtpbmRleF0uY29kZSA9PT0gJHJ1YnVzRG9jQ29uZmlnLmxhbmcpIHtcbiAgICAgICAgcmVzdWx0TGFuZ3VhZ2VJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICBuYXYge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICB3aWR0aDogMTAwdnc7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc3BlY3RydW0tZ2xvYmFsLWNvbG9yLWdyYXktNTApO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgei1pbmRleDogMjAwO1xuICB9XG4gIHVsIHtcbiAgICBtYXJnaW46IDA7XG4gICAgcGFkZGluZzogMDtcbiAgfVxuICBsaSB7XG4gICAgbGlzdC1zdHlsZS10eXBlOiBub25lO1xuICB9XG4gIGEsXG4gIGE6aG92ZXIsXG4gIGE6Zm9jdXMsXG4gIGE6YWN0aXZlIHtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gIH1cbiAgLm5hdi13cmFwIHtcbiAgICB3aWR0aDogOTglO1xuICAgIGhlaWdodDogNjBweDtcblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICB9XG4gIC5uYXYtaXRlbSB7XG4gICAgaGVpZ2h0OiA2MHB4O1xuICB9XG4gIC5uYXYtbG9nbyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICB9XG5cbiAgaW1nIHtcbiAgICBoZWlnaHQ6IDQwcHg7XG4gIH1cblxuICAucm91dGVyLXdyYXAge1xuICAgIGhlaWdodDogNjBweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICB9XG4gIC5yb3V0ZS1pdGVtIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG5cbiAgICB3aWR0aDogMTIwcHg7XG4gICAgbGluZS1oZWlnaHQ6IDYwcHg7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgfVxuICAuY3VycmVudC1yb3V0ZSB7XG4gICAgY29sb3I6IHZhcigtLXNwZWN0cnVtLXNlbWFudGljLWN0YS1jb2xvci1iYWNrZ3JvdW5kLWRlZmF1bHQpO1xuICB9XG5cbiAgc3BhbiB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zcGVjdHJ1bS1zZW1hbnRpYy1jdGEtY29sb3ItYmFja2dyb3VuZC1kZWZhdWx0KTtcbiAgICBsZWZ0OiA0NXB4O1xuICAgIHdpZHRoOiAzMHB4O1xuICAgIGhlaWdodDogNC41cHg7XG4gICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogNC41cHg7XG4gICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IDQuNXB4O1xuICB9XG4gIC5uYXYtbWVudS1hcmVhIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgfVxuICAudGhlbWUtbGlzdCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGhlaWdodDogNjBweDtcbiAgfVxuICAubGFuZ3VhZ2UtbGlzdCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDogMTQwcHg7XG4gICAgaGVpZ2h0OiA2MHB4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgfVxuPC9zdHlsZT5cblxuPG5hdj5cbiAgPHVsIGNsYXNzPVwibmF2LXdyYXBcIj5cbiAgICA8bGkgY2xhc3M9XCJuYXYtaXRlbSBuYXYtbG9nb1wiPlxuICAgICAgPGEgaHJlZj1cIi4vXCI+XG4gICAgICAgIDxpbWdcbiAgICAgICAgICBzcmM9XCJsb2dvLXskcnVidXNEb2NDb25maWcudGhlbWUgPT0gJ2xpZ2h0JyB8fCAkcnVidXNEb2NDb25maWcudGhlbWUgPT0gJ2xpZ2h0ZXN0JyA/ICdsaWdodCcgOiAnZGFyayd9LnBuZ1wiXG4gICAgICAgICAgYWx0PVwibG9nb1wiIC8+XG4gICAgICA8L2E+XG4gICAgPC9saT5cbiAgICA8bGkgY2xhc3M9XCJuYXYtaXRlbVwiPlxuICAgICAgPHVsIGNsYXNzPVwicm91dGVyLXdyYXBcIj5cbiAgICAgICAgeyNlYWNoIHJvdXRlclskcnVidXNEb2NDb25maWcubGFuZ10gYXMgcm91dGUsIGl9XG4gICAgICAgICAgPGxpXG4gICAgICAgICAgICBjbGFzcz1cInJvdXRlLWl0ZW1cIlxuICAgICAgICAgICAgY2xhc3M6Y3VycmVudC1yb3V0ZT17cm91dGUudXJsLnJlcGxhY2UoJy4vJywgJycpID09PSBzZWdtZW50IHx8IChyb3V0ZS51cmwgPT09ICcuLycgJiYgIXNlZ21lbnQgJiYgaSA9PSAwKX0+XG4gICAgICAgICAgICA8YSBocmVmPXtyb3V0ZS51cmx9Pntyb3V0ZS5uYW1lfVxuICAgICAgICAgICAgICB7I2lmIHJvdXRlLnVybC5yZXBsYWNlKCcuLycsICcnKSA9PT0gc2VnbWVudCB8fCAocm91dGUudXJsID09PSAnLi8nICYmICFzZWdtZW50ICYmIGkgPT0gMCl9XG4gICAgICAgICAgICAgICAgPHNwYW4gLz5cbiAgICAgICAgICAgICAgey9pZn08L2E+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgey9lYWNofVxuICAgICAgPC91bD5cbiAgICA8L2xpPlxuICAgIDxsaSBjbGFzcz1cIm5hdi1pdGVtIG5hdi1tZW51LWFyZWFcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0aGVtZS1saXN0XCI+XG4gICAgICAgIDxEcm9wZG93blxuICAgICAgICAgIHBsYWNlaG9sZGVyPXskcnVidXNEb2NDb25maWcudGhlbWUucmVwbGFjZSgvXlxcUy8sIChzKSA9PiBzLnRvVXBwZXJDYXNlKCkpfVxuICAgICAgICAgIGlzUXVpZXRcbiAgICAgICAgICBtaW5XaWR0aD1cIjgwXCJcbiAgICAgICAgICByZXN1bHRJbmRleD17cmVzdWx0VGhlbWVJbmRleH0+XG4gICAgICAgICAgeyNlYWNoIHRoZW1lTGlzdCBhcyBpdGVtLCBpbmRleH1cbiAgICAgICAgICAgIDxNZW51SXRlbVxuICAgICAgICAgICAgICB0aGlzSW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgICBsYWJlbD17aXRlbS5yZXBsYWNlKC9eXFxTLywgKHMpID0+IHMudG9VcHBlckNhc2UoKSl9XG4gICAgICAgICAgICAgIHJlc3VsdEluZGV4PXtyZXN1bHRUaGVtZUluZGV4fVxuICAgICAgICAgICAgICBvbjpjbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHN3aXRjaFRoZW1lKGl0ZW0pO1xuICAgICAgICAgICAgICB9fSAvPlxuICAgICAgICAgIHsvZWFjaH1cbiAgICAgICAgPC9Ecm9wZG93bj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImxhbmd1YWdlLWxpc3RcIj5cbiAgICAgICAgPERyb3Bkb3duIHBsYWNlaG9sZGVyPVwiTGFuZ3VhZ2VcIiBpc1F1aWV0IG1pbldpZHRoPVwiODBcIiByZXN1bHRJbmRleD17cmVzdWx0TGFuZ3VhZ2VJbmRleH0+XG4gICAgICAgICAgeyNlYWNoIGxhbmd1YWdlTGlzdCBhcyBsYW5nLCBpfVxuICAgICAgICAgICAgPE1lbnVJdGVtXG4gICAgICAgICAgICAgIHRoaXNJbmRleD17aX1cbiAgICAgICAgICAgICAgbGFiZWw9e2xhbmcubmFtZX1cbiAgICAgICAgICAgICAgcmVzdWx0SW5kZXg9e3Jlc3VsdExhbmd1YWdlSW5kZXh9XG4gICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e2kgPT09IHJlc3VsdExhbmd1YWdlSW5kZXh9XG4gICAgICAgICAgICAgIG9uOmNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoTGFuZ3VhZ2UobGFuZy5jb2RlKTtcbiAgICAgICAgICAgICAgfX0gLz5cbiAgICAgICAgICB7L2VhY2h9XG4gICAgICAgIDwvRHJvcGRvd24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2xpPlxuICA8L3VsPlxuPC9uYXY+XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgeyBDb3JuZXJzdG9uZSB9IGZyb20gXCJAcnVidXMvcnVidXMvc3JjXCI7XG4gIGltcG9ydCB7IHNldENvbnRleHQsIGdldENvbnRleHQsIG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7XG4gIGltcG9ydCB7IHdyaXRhYmxlIH0gZnJvbSBcInN2ZWx0ZS9zdG9yZVwiO1xuICBpbXBvcnQgeyBOYXYgfSBmcm9tIFwiLi4vY29tcG9uZW50c1wiO1xuICBleHBvcnQgbGV0IHNlZ21lbnQ7XG5cbiAgY29uc3QgcnVidXNEb2NDb25maWcgPSB3cml0YWJsZSh7XG4gICAgbmFtZTogXCJSdWJ1c1wiLFxuICAgIGxhbmc6IFwiemhcIixcbiAgICB0aGVtZTogXCJsaWdodFwiLFxuICB9KTtcbiAgc2V0Q29udGV4dChcInJ1YnVzRG9jQ29uZmlnXCIsIHJ1YnVzRG9jQ29uZmlnKTtcbiAgbGV0IF9ydWJ1c0RvY0NvbmZpZyA9IGdldENvbnRleHQoXCJydWJ1c0RvY0NvbmZpZ1wiKTtcblxuICBvbk1vdW50KCgpID0+IHtcbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwicnVidXMtbG9jYWwtY29uZmlnLXRoZW1lXCIpKSB7XG4gICAgICAkX3J1YnVzRG9jQ29uZmlnLnRoZW1lID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwicnVidXMtbG9jYWwtY29uZmlnLXRoZW1lXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJydWJ1cy1sb2NhbC1jb25maWctdGhlbWVcIiwgJF9ydWJ1c0RvY0NvbmZpZy50aGVtZSk7XG4gICAgfVxuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJydWJ1cy1sb2NhbC1jb25maWctbGFuZ1wiKSkge1xuICAgICAgJF9ydWJ1c0RvY0NvbmZpZy5sYW5nID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwicnVidXMtbG9jYWwtY29uZmlnLWxhbmdcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInJ1YnVzLWxvY2FsLWNvbmZpZy1sYW5nXCIsICRfcnVidXNEb2NDb25maWcubGFuZyk7XG4gICAgfVxuICB9KTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIG1haW4ge1xuICAgIG1hcmdpbi10b3A6IDEwMHB4O1xuICAgIG1heC13aWR0aDogMTIwMHB4O1xuICAgIG1hcmdpbi1sZWZ0OiBhdXRvO1xuICAgIG1hcmdpbi1yaWdodDogYXV0bztcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbiAgfVxuPC9zdHlsZT5cblxuPENvcm5lcnN0b25lIHNwZWN0cnVtVGhlbWU9eyRfcnVidXNEb2NDb25maWcudGhlbWV9PlxuICA8TmF2IHtzZWdtZW50fSAvPlxuICA8bWFpbj5cbiAgICA8c2xvdCAvPlxuICA8L21haW4+XG48L0Nvcm5lcnN0b25lPlxuIiwiPHNjcmlwdD5cblx0ZXhwb3J0IGxldCBzdGF0dXM7XG5cdGV4cG9ydCBsZXQgZXJyb3I7XG5cblx0Y29uc3QgZGV2ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCc7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuXHRoMSwgcCB7XG5cdFx0bWFyZ2luOiAwIGF1dG87XG5cdH1cblxuXHRoMSB7XG5cdFx0Zm9udC1zaXplOiAyLjhlbTtcblx0XHRmb250LXdlaWdodDogNzAwO1xuXHRcdG1hcmdpbjogMCAwIDAuNWVtIDA7XG5cdH1cblxuXHRwIHtcblx0XHRtYXJnaW46IDFlbSBhdXRvO1xuXHR9XG5cblx0QG1lZGlhIChtaW4td2lkdGg6IDQ4MHB4KSB7XG5cdFx0aDEge1xuXHRcdFx0Zm9udC1zaXplOiA0ZW07XG5cdFx0fVxuXHR9XG48L3N0eWxlPlxuXG48c3ZlbHRlOmhlYWQ+XG5cdDx0aXRsZT57c3RhdHVzfTwvdGl0bGU+XG48L3N2ZWx0ZTpoZWFkPlxuXG48aDE+e3N0YXR1c308L2gxPlxuXG48cD57ZXJyb3IubWVzc2FnZX08L3A+XG5cbnsjaWYgZGV2ICYmIGVycm9yLnN0YWNrfVxuXHQ8cHJlPntlcnJvci5zdGFja308L3ByZT5cbnsvaWZ9XG4iLCI8IS0tIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgU2FwcGVyIOKAlCBkbyBub3QgZWRpdCBpdCEgLS0+XG48c2NyaXB0PlxuXHRpbXBvcnQgeyBzZXRDb250ZXh0LCBhZnRlclVwZGF0ZSB9IGZyb20gJ3N2ZWx0ZSc7XG5cdGltcG9ydCB7IENPTlRFWFRfS0VZIH0gZnJvbSAnLi9zaGFyZWQnO1xuXHRpbXBvcnQgTGF5b3V0IGZyb20gJy4uLy4uLy4uL3JvdXRlcy9fbGF5b3V0LnN2ZWx0ZSc7XG5cdGltcG9ydCBFcnJvciBmcm9tICcuLi8uLi8uLi9yb3V0ZXMvX2Vycm9yLnN2ZWx0ZSc7XG5cblx0ZXhwb3J0IGxldCBzdG9yZXM7XG5cdGV4cG9ydCBsZXQgZXJyb3I7XG5cdGV4cG9ydCBsZXQgc3RhdHVzO1xuXHRleHBvcnQgbGV0IHNlZ21lbnRzO1xuXHRleHBvcnQgbGV0IGxldmVsMDtcblx0ZXhwb3J0IGxldCBsZXZlbDEgPSBudWxsO1xuXHRleHBvcnQgbGV0IGxldmVsMiA9IG51bGw7XG5cdGV4cG9ydCBsZXQgbm90aWZ5O1xuXG5cdGFmdGVyVXBkYXRlKG5vdGlmeSk7XG5cdHNldENvbnRleHQoQ09OVEVYVF9LRVksIHN0b3Jlcyk7XG48L3NjcmlwdD5cblxuPExheW91dCBzZWdtZW50PVwie3NlZ21lbnRzWzBdfVwiIHsuLi5sZXZlbDAucHJvcHN9PlxuXHR7I2lmIGVycm9yfVxuXHRcdDxFcnJvciB7ZXJyb3J9IHtzdGF0dXN9Lz5cblx0ezplbHNlfVxuXHRcdDxzdmVsdGU6Y29tcG9uZW50IHRoaXM9XCJ7bGV2ZWwxLmNvbXBvbmVudH1cIiBzZWdtZW50PVwie3NlZ21lbnRzWzFdfVwiIHsuLi5sZXZlbDEucHJvcHN9PlxuXHRcdFx0eyNpZiBsZXZlbDJ9XG5cdFx0XHRcdDxzdmVsdGU6Y29tcG9uZW50IHRoaXM9XCJ7bGV2ZWwyLmNvbXBvbmVudH1cIiB7Li4ubGV2ZWwyLnByb3BzfS8+XG5cdFx0XHR7L2lmfVxuXHRcdDwvc3ZlbHRlOmNvbXBvbmVudD5cblx0ey9pZn1cbjwvTGF5b3V0PiIsIi8vIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgU2FwcGVyIOKAlCBkbyBub3QgZWRpdCBpdCFcbi8vIHdlYnBhY2sgZG9lcyBub3Qgc3VwcG9ydCBleHBvcnQgKiBhcyByb290X2NvbXAgeWV0IHNvIGRvIGEgdHdvIGxpbmUgaW1wb3J0L2V4cG9ydFxuaW1wb3J0ICogYXMgcm9vdF9jb21wIGZyb20gJy4uLy4uLy4uL3JvdXRlcy9fbGF5b3V0LnN2ZWx0ZSc7XG5leHBvcnQgeyByb290X2NvbXAgfTtcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRXJyb3JDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi9yb3V0ZXMvX2Vycm9yLnN2ZWx0ZSc7XG5cbmV4cG9ydCBjb25zdCBpZ25vcmUgPSBbXTtcblxuZXhwb3J0IGNvbnN0IGNvbXBvbmVudHMgPSBbXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL2luZGV4LnN2ZWx0ZVwiKVxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9kb2NzL19sYXlvdXQuc3ZlbHRlXCIpXG5cdH0sXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL2RvY3MvaW5kZXguc3ZlbHRlXCIpXG5cdH0sXG5cdHtcblx0XHRqczogKCkgPT4gaW1wb3J0KFwiLi4vLi4vLi4vcm91dGVzL2RvY3MvY3NzdG9rZW5zL2NvbG9yL2luZGV4LnN2ZWx0ZVwiKVxuXHR9XG5dO1xuXG5leHBvcnQgY29uc3Qgcm91dGVzID0gW1xuXHR7XG5cdFx0Ly8gaW5kZXguc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC8kLyxcblx0XHRwYXJ0czogW1xuXHRcdFx0eyBpOiAwIH1cblx0XHRdXG5cdH0sXG5cblx0e1xuXHRcdC8vIGRvY3MvaW5kZXguc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC9kb2NzXFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHR7IGk6IDEgfSxcblx0XHRcdHsgaTogMiB9XG5cdFx0XVxuXHR9LFxuXG5cdHtcblx0XHQvLyBkb2NzL2Nzc3Rva2Vucy9jb2xvci9pbmRleC5zdmVsdGVcblx0XHRwYXR0ZXJuOiAvXlxcL2RvY3NcXC9jc3N0b2tlbnNcXC9jb2xvclxcLz8kLyxcblx0XHRwYXJ0czogW1xuXHRcdFx0eyBpOiAxIH0sXG5cdFx0XHRudWxsLFxuXHRcdFx0eyBpOiAzIH1cblx0XHRdXG5cdH1cbl07XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuXHRpbXBvcnQoXCIvVXNlcnMvcnVubmluZ3pzL0Rlc2t0b3AvcnVidXMtZG9jL25vZGVfbW9kdWxlcy9zYXBwZXIvc2FwcGVyLWRldi1jbGllbnQuanNcIikudGhlbihjbGllbnQgPT4ge1xuXHRcdGNsaWVudC5jb25uZWN0KDEwMDAwKTtcblx0fSk7XG59IiwiaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gJ3N2ZWx0ZSc7XG5pbXBvcnQgeyBDT05URVhUX0tFWSB9IGZyb20gJy4vaW50ZXJuYWwvc2hhcmVkJztcbmltcG9ydCB7IHdyaXRhYmxlIH0gZnJvbSAnc3ZlbHRlL3N0b3JlJztcbmltcG9ydCBBcHAgZnJvbSAnLi9pbnRlcm5hbC9BcHAuc3ZlbHRlJztcbmltcG9ydCB7IGlnbm9yZSwgcm91dGVzLCByb290X2NvbXAsIGNvbXBvbmVudHMsIEVycm9yQ29tcG9uZW50IH0gZnJvbSAnLi9pbnRlcm5hbC9tYW5pZmVzdC1jbGllbnQnO1xuXG4vKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG5cclxuZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxuXG5mdW5jdGlvbiBmaW5kX2FuY2hvcihub2RlKSB7XHJcbiAgICB3aGlsZSAobm9kZSAmJiBub2RlLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdBJylcclxuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlOyAvLyBTVkcgPGE+IGVsZW1lbnRzIGhhdmUgYSBsb3dlcmNhc2UgbmFtZVxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbn1cblxubGV0IHVpZCA9IDE7XHJcbmZ1bmN0aW9uIHNldF91aWQobikge1xyXG4gICAgdWlkID0gbjtcclxufVxyXG5sZXQgY2lkO1xyXG5mdW5jdGlvbiBzZXRfY2lkKG4pIHtcclxuICAgIGNpZCA9IG47XHJcbn1cclxuY29uc3QgX2hpc3RvcnkgPSB0eXBlb2YgaGlzdG9yeSAhPT0gJ3VuZGVmaW5lZCcgPyBoaXN0b3J5IDoge1xyXG4gICAgcHVzaFN0YXRlOiAoKSA9PiB7IH0sXHJcbiAgICByZXBsYWNlU3RhdGU6ICgpID0+IHsgfSxcclxuICAgIHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0bydcclxufTtcclxuY29uc3Qgc2Nyb2xsX2hpc3RvcnkgPSB7fTtcclxuZnVuY3Rpb24gbG9hZF9jdXJyZW50X3BhZ2UoKSB7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgeyBoYXNoLCBocmVmIH0gPSBsb2NhdGlvbjtcclxuICAgICAgICBfaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBpZDogdWlkIH0sICcnLCBocmVmKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KG5ldyBVUkwobG9jYXRpb24uaHJlZikpO1xyXG4gICAgICAgIGlmICh0YXJnZXQpXHJcbiAgICAgICAgICAgIHJldHVybiBuYXZpZ2F0ZSh0YXJnZXQsIHVpZCwgdHJ1ZSwgaGFzaCk7XHJcbiAgICB9KTtcclxufVxyXG5sZXQgYmFzZV91cmw7XHJcbmxldCBoYW5kbGVfdGFyZ2V0O1xyXG5mdW5jdGlvbiBpbml0KGJhc2UsIGhhbmRsZXIpIHtcclxuICAgIGJhc2VfdXJsID0gYmFzZTtcclxuICAgIGhhbmRsZV90YXJnZXQgPSBoYW5kbGVyO1xyXG4gICAgaWYgKCdzY3JvbGxSZXN0b3JhdGlvbicgaW4gX2hpc3RvcnkpIHtcclxuICAgICAgICBfaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbiA9ICdtYW51YWwnO1xyXG4gICAgfVxyXG4gICAgLy8gQWRvcHRlZCBmcm9tIE51eHQuanNcclxuICAgIC8vIFJlc2V0IHNjcm9sbFJlc3RvcmF0aW9uIHRvIGF1dG8gd2hlbiBsZWF2aW5nIHBhZ2UsIGFsbG93aW5nIHBhZ2UgcmVsb2FkXHJcbiAgICAvLyBhbmQgYmFjay1uYXZpZ2F0aW9uIGZyb20gb3RoZXIgcGFnZXMgdG8gdXNlIHRoZSBicm93c2VyIHRvIHJlc3RvcmUgdGhlXHJcbiAgICAvLyBzY3JvbGxpbmcgcG9zaXRpb24uXHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgX2hpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSAnYXV0byc7XHJcbiAgICB9KTtcclxuICAgIC8vIFNldHRpbmcgc2Nyb2xsUmVzdG9yYXRpb24gdG8gbWFudWFsIGFnYWluIHdoZW4gcmV0dXJuaW5nIHRvIHRoaXMgcGFnZS5cclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgX2hpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSAnbWFudWFsJztcclxuICAgIH0pO1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVfY2xpY2spO1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBoYW5kbGVfcG9wc3RhdGUpO1xyXG59XHJcbmZ1bmN0aW9uIGV4dHJhY3RfcXVlcnkoc2VhcmNoKSB7XHJcbiAgICBjb25zdCBxdWVyeSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgICBpZiAoc2VhcmNoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBzZWFyY2guc2xpY2UoMSkuc3BsaXQoJyYnKS5mb3JFYWNoKHNlYXJjaFBhcmFtID0+IHtcclxuICAgICAgICAgICAgY29uc3QgWywga2V5LCB2YWx1ZSA9ICcnXSA9IC8oW149XSopKD86PSguKikpPy8uZXhlYyhkZWNvZGVVUklDb21wb25lbnQoc2VhcmNoUGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykpKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBxdWVyeVtrZXldID09PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgIHF1ZXJ5W2tleV0gPSBbcXVlcnlba2V5XV07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcXVlcnlba2V5XSA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgICAgICAgICBxdWVyeVtrZXldLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBxdWVyeVtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnk7XHJcbn1cclxuZnVuY3Rpb24gc2VsZWN0X3RhcmdldCh1cmwpIHtcclxuICAgIGlmICh1cmwub3JpZ2luICE9PSBsb2NhdGlvbi5vcmlnaW4pXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICBpZiAoIXVybC5wYXRobmFtZS5zdGFydHNXaXRoKGJhc2VfdXJsKSlcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIGxldCBwYXRoID0gdXJsLnBhdGhuYW1lLnNsaWNlKGJhc2VfdXJsLmxlbmd0aCk7XHJcbiAgICBpZiAocGF0aCA9PT0gJycpIHtcclxuICAgICAgICBwYXRoID0gJy8nO1xyXG4gICAgfVxyXG4gICAgLy8gYXZvaWQgYWNjaWRlbnRhbCBjbGFzaGVzIGJldHdlZW4gc2VydmVyIHJvdXRlcyBhbmQgcGFnZSByb3V0ZXNcclxuICAgIGlmIChpZ25vcmUuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4udGVzdChwYXRoKSkpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBjb25zdCByb3V0ZSA9IHJvdXRlc1tpXTtcclxuICAgICAgICBjb25zdCBtYXRjaCA9IHJvdXRlLnBhdHRlcm4uZXhlYyhwYXRoKTtcclxuICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBleHRyYWN0X3F1ZXJ5KHVybC5zZWFyY2gpO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gcm91dGUucGFydHNbcm91dGUucGFydHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHBhcnQucGFyYW1zID8gcGFydC5wYXJhbXMobWF0Y2gpIDoge307XHJcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSB7IGhvc3Q6IGxvY2F0aW9uLmhvc3QsIHBhdGgsIHF1ZXJ5LCBwYXJhbXMgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgaHJlZjogdXJsLmhyZWYsIHJvdXRlLCBtYXRjaCwgcGFnZSB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBoYW5kbGVfY2xpY2soZXZlbnQpIHtcclxuICAgIC8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvcGFnZS5qc1xyXG4gICAgLy8gTUlUIGxpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanMjbGljZW5zZVxyXG4gICAgaWYgKHdoaWNoKGV2ZW50KSAhPT0gMSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICBpZiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5IHx8IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50LmFsdEtleSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICBpZiAoZXZlbnQuZGVmYXVsdFByZXZlbnRlZClcclxuICAgICAgICByZXR1cm47XHJcbiAgICBjb25zdCBhID0gZmluZF9hbmNob3IoZXZlbnQudGFyZ2V0KTtcclxuICAgIGlmICghYSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICBpZiAoIWEuaHJlZilcclxuICAgICAgICByZXR1cm47XHJcbiAgICAvLyBjaGVjayBpZiBsaW5rIGlzIGluc2lkZSBhbiBzdmdcclxuICAgIC8vIGluIHRoaXMgY2FzZSwgYm90aCBocmVmIGFuZCB0YXJnZXQgYXJlIGFsd2F5cyBpbnNpZGUgYW4gb2JqZWN0XHJcbiAgICBjb25zdCBzdmcgPSB0eXBlb2YgYS5ocmVmID09PSAnb2JqZWN0JyAmJiBhLmhyZWYuY29uc3RydWN0b3IubmFtZSA9PT0gJ1NWR0FuaW1hdGVkU3RyaW5nJztcclxuICAgIGNvbnN0IGhyZWYgPSBTdHJpbmcoc3ZnID8gYS5ocmVmLmJhc2VWYWwgOiBhLmhyZWYpO1xyXG4gICAgaWYgKGhyZWYgPT09IGxvY2F0aW9uLmhyZWYpIHtcclxuICAgICAgICBpZiAoIWxvY2F0aW9uLmhhc2gpXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gSWdub3JlIGlmIHRhZyBoYXNcclxuICAgIC8vIDEuICdkb3dubG9hZCcgYXR0cmlidXRlXHJcbiAgICAvLyAyLiByZWw9J2V4dGVybmFsJyBhdHRyaWJ1dGVcclxuICAgIGlmIChhLmhhc0F0dHJpYnV0ZSgnZG93bmxvYWQnKSB8fCBhLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdleHRlcm5hbCcpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gSWdub3JlIGlmIDxhPiBoYXMgYSB0YXJnZXRcclxuICAgIGlmIChzdmcgPyBhLnRhcmdldC5iYXNlVmFsIDogYS50YXJnZXQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChocmVmKTtcclxuICAgIC8vIERvbid0IGhhbmRsZSBoYXNoIGNoYW5nZXNcclxuICAgIGlmICh1cmwucGF0aG5hbWUgPT09IGxvY2F0aW9uLnBhdGhuYW1lICYmIHVybC5zZWFyY2ggPT09IGxvY2F0aW9uLnNlYXJjaClcclxuICAgICAgICByZXR1cm47XHJcbiAgICBjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KHVybCk7XHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgY29uc3Qgbm9zY3JvbGwgPSBhLmhhc0F0dHJpYnV0ZSgnc2FwcGVyOm5vc2Nyb2xsJyk7XHJcbiAgICAgICAgbmF2aWdhdGUodGFyZ2V0LCBudWxsLCBub3Njcm9sbCwgdXJsLmhhc2gpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgX2hpc3RvcnkucHVzaFN0YXRlKHsgaWQ6IGNpZCB9LCAnJywgdXJsLmhyZWYpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIHdoaWNoKGV2ZW50KSB7XHJcbiAgICByZXR1cm4gZXZlbnQud2hpY2ggPT09IG51bGwgPyBldmVudC5idXR0b24gOiBldmVudC53aGljaDtcclxufVxyXG5mdW5jdGlvbiBzY3JvbGxfc3RhdGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHBhZ2VYT2Zmc2V0LFxyXG4gICAgICAgIHk6IHBhZ2VZT2Zmc2V0XHJcbiAgICB9O1xyXG59XHJcbmZ1bmN0aW9uIGhhbmRsZV9wb3BzdGF0ZShldmVudCkge1xyXG4gICAgc2Nyb2xsX2hpc3RvcnlbY2lkXSA9IHNjcm9sbF9zdGF0ZSgpO1xyXG4gICAgaWYgKGV2ZW50LnN0YXRlKSB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KHVybCk7XHJcbiAgICAgICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgICAgICBuYXZpZ2F0ZSh0YXJnZXQsIGV2ZW50LnN0YXRlLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjsgLy8gbm9zb25hclxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIGhhc2hjaGFuZ2VcclxuICAgICAgICBzZXRfdWlkKHVpZCArIDEpO1xyXG4gICAgICAgIHNldF9jaWQodWlkKTtcclxuICAgICAgICBfaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBpZDogY2lkIH0sICcnLCBsb2NhdGlvbi5ocmVmKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBuYXZpZ2F0ZShkZXN0LCBpZCwgbm9zY3JvbGwsIGhhc2gpIHtcclxuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgY29uc3QgcG9wc3RhdGUgPSAhIWlkO1xyXG4gICAgICAgIGlmIChwb3BzdGF0ZSkge1xyXG4gICAgICAgICAgICBjaWQgPSBpZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRfc2Nyb2xsID0gc2Nyb2xsX3N0YXRlKCk7XHJcbiAgICAgICAgICAgIC8vIGNsaWNrZWQgb24gYSBsaW5rLiBwcmVzZXJ2ZSBzY3JvbGwgc3RhdGVcclxuICAgICAgICAgICAgc2Nyb2xsX2hpc3RvcnlbY2lkXSA9IGN1cnJlbnRfc2Nyb2xsO1xyXG4gICAgICAgICAgICBjaWQgPSBpZCA9ICsrdWlkO1xyXG4gICAgICAgICAgICBzY3JvbGxfaGlzdG9yeVtjaWRdID0gbm9zY3JvbGwgPyBjdXJyZW50X3Njcm9sbCA6IHsgeDogMCwgeTogMCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB5aWVsZCBoYW5kbGVfdGFyZ2V0KGRlc3QpO1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcclxuICAgICAgICBpZiAoIW5vc2Nyb2xsKSB7XHJcbiAgICAgICAgICAgIGxldCBzY3JvbGwgPSBzY3JvbGxfaGlzdG9yeVtpZF07XHJcbiAgICAgICAgICAgIGxldCBkZWVwX2xpbmtlZDtcclxuICAgICAgICAgICAgaWYgKGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIC8vIHNjcm9sbCBpcyBhbiBlbGVtZW50IGlkIChmcm9tIGEgaGFzaCksIHdlIG5lZWQgdG8gY29tcHV0ZSB5LlxyXG4gICAgICAgICAgICAgICAgZGVlcF9saW5rZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYXNoLnNsaWNlKDEpKTtcclxuICAgICAgICAgICAgICAgIGlmIChkZWVwX2xpbmtlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogZGVlcF9saW5rZWQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgc2Nyb2xsWVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2Nyb2xsX2hpc3RvcnlbY2lkXSA9IHNjcm9sbDtcclxuICAgICAgICAgICAgaWYgKHBvcHN0YXRlIHx8IGRlZXBfbGlua2VkKSB7XHJcbiAgICAgICAgICAgICAgICBzY3JvbGxUbyhzY3JvbGwueCwgc2Nyb2xsLnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG8oMCwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxuXG5mdW5jdGlvbiBnZXRfYmFzZV91cmkod2luZG93X2RvY3VtZW50KSB7XHJcbiAgICBsZXQgYmFzZVVSSSA9IHdpbmRvd19kb2N1bWVudC5iYXNlVVJJO1xyXG4gICAgaWYgKCFiYXNlVVJJKSB7XHJcbiAgICAgICAgY29uc3QgYmFzZVRhZ3MgPSB3aW5kb3dfZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcclxuICAgICAgICBiYXNlVVJJID0gYmFzZVRhZ3MubGVuZ3RoID8gYmFzZVRhZ3NbMF0uaHJlZiA6IHdpbmRvd19kb2N1bWVudC5VUkw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYmFzZVVSSTtcclxufVxuXG5sZXQgcHJlZmV0Y2hpbmcgPSBudWxsO1xyXG5sZXQgbW91c2Vtb3ZlX3RpbWVvdXQ7XHJcbmZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRyaWdnZXJfcHJlZmV0Y2gpO1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlX21vdXNlbW92ZSk7XHJcbn1cclxuZnVuY3Rpb24gcHJlZmV0Y2goaHJlZikge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldChuZXcgVVJMKGhyZWYsIGdldF9iYXNlX3VyaShkb2N1bWVudCkpKTtcclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBpZiAoIXByZWZldGNoaW5nIHx8IGhyZWYgIT09IHByZWZldGNoaW5nLmhyZWYpIHtcclxuICAgICAgICAgICAgcHJlZmV0Y2hpbmcgPSB7IGhyZWYsIHByb21pc2U6IGh5ZHJhdGVfdGFyZ2V0KHRhcmdldCkgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByZWZldGNoaW5nLnByb21pc2U7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gZ2V0X3ByZWZldGNoZWQodGFyZ2V0KSB7XHJcbiAgICBpZiAocHJlZmV0Y2hpbmcgJiYgcHJlZmV0Y2hpbmcuaHJlZiA9PT0gdGFyZ2V0LmhyZWYpIHtcclxuICAgICAgICByZXR1cm4gcHJlZmV0Y2hpbmcucHJvbWlzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBoeWRyYXRlX3RhcmdldCh0YXJnZXQpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIHRyaWdnZXJfcHJlZmV0Y2goZXZlbnQpIHtcclxuICAgIGNvbnN0IGEgPSBmaW5kX2FuY2hvcihldmVudC50YXJnZXQpO1xyXG4gICAgaWYgKGEgJiYgYS5yZWwgPT09ICdwcmVmZXRjaCcpIHtcclxuICAgICAgICBwcmVmZXRjaChhLmhyZWYpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGhhbmRsZV9tb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgIGNsZWFyVGltZW91dChtb3VzZW1vdmVfdGltZW91dCk7XHJcbiAgICBtb3VzZW1vdmVfdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRyaWdnZXJfcHJlZmV0Y2goZXZlbnQpO1xyXG4gICAgfSwgMjApO1xyXG59XG5cbmZ1bmN0aW9uIGdvdG8oaHJlZiwgb3B0cyA9IHsgbm9zY3JvbGw6IGZhbHNlLCByZXBsYWNlU3RhdGU6IGZhbHNlIH0pIHtcclxuICAgIGNvbnN0IHRhcmdldCA9IHNlbGVjdF90YXJnZXQobmV3IFVSTChocmVmLCBnZXRfYmFzZV91cmkoZG9jdW1lbnQpKSk7XHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgX2hpc3Rvcnlbb3B0cy5yZXBsYWNlU3RhdGUgPyAncmVwbGFjZVN0YXRlJyA6ICdwdXNoU3RhdGUnXSh7IGlkOiBjaWQgfSwgJycsIGhyZWYpO1xyXG4gICAgICAgIHJldHVybiBuYXZpZ2F0ZSh0YXJnZXQsIG51bGwsIG9wdHMubm9zY3JvbGwpO1xyXG4gICAgfVxyXG4gICAgbG9jYXRpb24uaHJlZiA9IGhyZWY7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xyXG4gICAgICAgIC8qIG5ldmVyIHJlc29sdmVzICovXHJcbiAgICB9KTtcclxufVxuXG5mdW5jdGlvbiBwYWdlX3N0b3JlKHZhbHVlKSB7XHJcbiAgICBjb25zdCBzdG9yZSA9IHdyaXRhYmxlKHZhbHVlKTtcclxuICAgIGxldCByZWFkeSA9IHRydWU7XHJcbiAgICBmdW5jdGlvbiBub3RpZnkoKSB7XHJcbiAgICAgICAgcmVhZHkgPSB0cnVlO1xyXG4gICAgICAgIHN0b3JlLnVwZGF0ZSh2YWwgPT4gdmFsKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHNldChuZXdfdmFsdWUpIHtcclxuICAgICAgICByZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHN0b3JlLnNldChuZXdfdmFsdWUpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc3Vic2NyaWJlKHJ1bikge1xyXG4gICAgICAgIGxldCBvbGRfdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHN0b3JlLnN1YnNjcmliZSgobmV3X3ZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvbGRfdmFsdWUgPT09IHVuZGVmaW5lZCB8fCAocmVhZHkgJiYgbmV3X3ZhbHVlICE9PSBvbGRfdmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBydW4ob2xkX3ZhbHVlID0gbmV3X3ZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgbm90aWZ5LCBzZXQsIHN1YnNjcmliZSB9O1xyXG59XG5cbmNvbnN0IGluaXRpYWxfZGF0YSA9IHR5cGVvZiBfX1NBUFBFUl9fICE9PSAndW5kZWZpbmVkJyAmJiBfX1NBUFBFUl9fO1xyXG5sZXQgcmVhZHkgPSBmYWxzZTtcclxubGV0IHJvb3RfY29tcG9uZW50O1xyXG5sZXQgY3VycmVudF90b2tlbjtcclxubGV0IHJvb3RfcHJlbG9hZGVkO1xyXG5sZXQgY3VycmVudF9icmFuY2ggPSBbXTtcclxubGV0IGN1cnJlbnRfcXVlcnkgPSAne30nO1xyXG5jb25zdCBzdG9yZXMgPSB7XHJcbiAgICBwYWdlOiBwYWdlX3N0b3JlKHt9KSxcclxuICAgIHByZWxvYWRpbmc6IHdyaXRhYmxlKG51bGwpLFxyXG4gICAgc2Vzc2lvbjogd3JpdGFibGUoaW5pdGlhbF9kYXRhICYmIGluaXRpYWxfZGF0YS5zZXNzaW9uKVxyXG59O1xyXG5sZXQgJHNlc3Npb247XHJcbmxldCBzZXNzaW9uX2RpcnR5O1xyXG5zdG9yZXMuc2Vzc2lvbi5zdWJzY3JpYmUoKHZhbHVlKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICRzZXNzaW9uID0gdmFsdWU7XHJcbiAgICBpZiAoIXJlYWR5KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIHNlc3Npb25fZGlydHkgPSB0cnVlO1xyXG4gICAgY29uc3QgZGVzdCA9IHNlbGVjdF90YXJnZXQobmV3IFVSTChsb2NhdGlvbi5ocmVmKSk7XHJcbiAgICBjb25zdCB0b2tlbiA9IGN1cnJlbnRfdG9rZW4gPSB7fTtcclxuICAgIGNvbnN0IHsgcmVkaXJlY3QsIHByb3BzLCBicmFuY2ggfSA9IHlpZWxkIGh5ZHJhdGVfdGFyZ2V0KGRlc3QpO1xyXG4gICAgaWYgKHRva2VuICE9PSBjdXJyZW50X3Rva2VuKVxyXG4gICAgICAgIHJldHVybjsgLy8gYSBzZWNvbmRhcnkgbmF2aWdhdGlvbiBoYXBwZW5lZCB3aGlsZSB3ZSB3ZXJlIGxvYWRpbmdcclxuICAgIGlmIChyZWRpcmVjdCkge1xyXG4gICAgICAgIHlpZWxkIGdvdG8ocmVkaXJlY3QubG9jYXRpb24sIHsgcmVwbGFjZVN0YXRlOiB0cnVlIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgeWllbGQgcmVuZGVyKGJyYW5jaCwgcHJvcHMsIGJ1aWxkUGFnZUNvbnRleHQocHJvcHMsIGRlc3QucGFnZSkpO1xyXG4gICAgfVxyXG59KSk7XHJcbmxldCB0YXJnZXQ7XHJcbmZ1bmN0aW9uIHNldF90YXJnZXQobm9kZSkge1xyXG4gICAgdGFyZ2V0ID0gbm9kZTtcclxufVxyXG5mdW5jdGlvbiBzdGFydCQxKG9wdHMpIHtcclxuICAgIHNldF90YXJnZXQob3B0cy50YXJnZXQpO1xyXG4gICAgaW5pdChpbml0aWFsX2RhdGEuYmFzZVVybCwgaGFuZGxlX3RhcmdldCQxKTtcclxuICAgIHN0YXJ0KCk7XHJcbiAgICBpZiAoaW5pdGlhbF9kYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlX2Vycm9yKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbG9hZF9jdXJyZW50X3BhZ2UoKTtcclxufVxyXG5mdW5jdGlvbiBoYW5kbGVfZXJyb3IoKSB7XHJcbiAgICBjb25zdCB7IGhvc3QsIHBhdGhuYW1lLCBzZWFyY2ggfSA9IGxvY2F0aW9uO1xyXG4gICAgY29uc3QgeyBzZXNzaW9uLCBwcmVsb2FkZWQsIHN0YXR1cywgZXJyb3IgfSA9IGluaXRpYWxfZGF0YTtcclxuICAgIGlmICghcm9vdF9wcmVsb2FkZWQpIHtcclxuICAgICAgICByb290X3ByZWxvYWRlZCA9IHByZWxvYWRlZCAmJiBwcmVsb2FkZWRbMF07XHJcbiAgICB9XHJcbiAgICBjb25zdCBwcm9wcyA9IHtcclxuICAgICAgICBlcnJvcixcclxuICAgICAgICBzdGF0dXMsXHJcbiAgICAgICAgc2Vzc2lvbixcclxuICAgICAgICBsZXZlbDA6IHtcclxuICAgICAgICAgICAgcHJvcHM6IHJvb3RfcHJlbG9hZGVkXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsZXZlbDE6IHtcclxuICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1cyxcclxuICAgICAgICAgICAgICAgIGVycm9yXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbXBvbmVudDogRXJyb3JDb21wb25lbnRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlZ21lbnRzOiBwcmVsb2FkZWRcclxuICAgIH07XHJcbiAgICBjb25zdCBxdWVyeSA9IGV4dHJhY3RfcXVlcnkoc2VhcmNoKTtcclxuICAgIHJlbmRlcihbXSwgcHJvcHMsIHsgaG9zdCwgcGF0aDogcGF0aG5hbWUsIHF1ZXJ5LCBwYXJhbXM6IHt9LCBlcnJvciB9KTtcclxufVxyXG5mdW5jdGlvbiBidWlsZFBhZ2VDb250ZXh0KHByb3BzLCBwYWdlKSB7XHJcbiAgICBjb25zdCB7IGVycm9yIH0gPSBwcm9wcztcclxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHsgZXJyb3IgfSwgcGFnZSk7XHJcbn1cclxuZnVuY3Rpb24gaGFuZGxlX3RhcmdldCQxKGRlc3QpIHtcclxuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgaWYgKHJvb3RfY29tcG9uZW50KVxyXG4gICAgICAgICAgICBzdG9yZXMucHJlbG9hZGluZy5zZXQodHJ1ZSk7XHJcbiAgICAgICAgY29uc3QgaHlkcmF0aW5nID0gZ2V0X3ByZWZldGNoZWQoZGVzdCk7XHJcbiAgICAgICAgY29uc3QgdG9rZW4gPSBjdXJyZW50X3Rva2VuID0ge307XHJcbiAgICAgICAgY29uc3QgaHlkcmF0ZWRfdGFyZ2V0ID0geWllbGQgaHlkcmF0aW5nO1xyXG4gICAgICAgIGNvbnN0IHsgcmVkaXJlY3QgfSA9IGh5ZHJhdGVkX3RhcmdldDtcclxuICAgICAgICBpZiAodG9rZW4gIT09IGN1cnJlbnRfdG9rZW4pXHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gYSBzZWNvbmRhcnkgbmF2aWdhdGlvbiBoYXBwZW5lZCB3aGlsZSB3ZSB3ZXJlIGxvYWRpbmdcclxuICAgICAgICBpZiAocmVkaXJlY3QpIHtcclxuICAgICAgICAgICAgeWllbGQgZ290byhyZWRpcmVjdC5sb2NhdGlvbiwgeyByZXBsYWNlU3RhdGU6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB7IHByb3BzLCBicmFuY2ggfSA9IGh5ZHJhdGVkX3RhcmdldDtcclxuICAgICAgICAgICAgeWllbGQgcmVuZGVyKGJyYW5jaCwgcHJvcHMsIGJ1aWxkUGFnZUNvbnRleHQocHJvcHMsIGRlc3QucGFnZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHJlbmRlcihicmFuY2gsIHByb3BzLCBwYWdlKSB7XHJcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgIHN0b3Jlcy5wYWdlLnNldChwYWdlKTtcclxuICAgICAgICBzdG9yZXMucHJlbG9hZGluZy5zZXQoZmFsc2UpO1xyXG4gICAgICAgIGlmIChyb290X2NvbXBvbmVudCkge1xyXG4gICAgICAgICAgICByb290X2NvbXBvbmVudC4kc2V0KHByb3BzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHByb3BzLnN0b3JlcyA9IHtcclxuICAgICAgICAgICAgICAgIHBhZ2U6IHsgc3Vic2NyaWJlOiBzdG9yZXMucGFnZS5zdWJzY3JpYmUgfSxcclxuICAgICAgICAgICAgICAgIHByZWxvYWRpbmc6IHsgc3Vic2NyaWJlOiBzdG9yZXMucHJlbG9hZGluZy5zdWJzY3JpYmUgfSxcclxuICAgICAgICAgICAgICAgIHNlc3Npb246IHN0b3Jlcy5zZXNzaW9uXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHByb3BzLmxldmVsMCA9IHtcclxuICAgICAgICAgICAgICAgIHByb3BzOiB5aWVsZCByb290X3ByZWxvYWRlZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwcm9wcy5ub3RpZnkgPSBzdG9yZXMucGFnZS5ub3RpZnk7XHJcbiAgICAgICAgICAgIHJvb3RfY29tcG9uZW50ID0gbmV3IEFwcCh7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgICAgIGh5ZHJhdGU6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1cnJlbnRfYnJhbmNoID0gYnJhbmNoO1xyXG4gICAgICAgIGN1cnJlbnRfcXVlcnkgPSBKU09OLnN0cmluZ2lmeShwYWdlLnF1ZXJ5KTtcclxuICAgICAgICByZWFkeSA9IHRydWU7XHJcbiAgICAgICAgc2Vzc2lvbl9kaXJ0eSA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbn1cclxuZnVuY3Rpb24gcGFydF9jaGFuZ2VkKGksIHNlZ21lbnQsIG1hdGNoLCBzdHJpbmdpZmllZF9xdWVyeSkge1xyXG4gICAgLy8gVE9ETyBvbmx5IGNoZWNrIHF1ZXJ5IHN0cmluZyBjaGFuZ2VzIGZvciBwcmVsb2FkIGZ1bmN0aW9uc1xyXG4gICAgLy8gdGhhdCBkbyBpbiBmYWN0IGRlcGVuZCBvbiBpdCAodXNpbmcgc3RhdGljIGFuYWx5c2lzIG9yXHJcbiAgICAvLyBydW50aW1lIGluc3RydW1lbnRhdGlvbilcclxuICAgIGlmIChzdHJpbmdpZmllZF9xdWVyeSAhPT0gY3VycmVudF9xdWVyeSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGNvbnN0IHByZXZpb3VzID0gY3VycmVudF9icmFuY2hbaV07XHJcbiAgICBpZiAoIXByZXZpb3VzKVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIGlmIChzZWdtZW50ICE9PSBwcmV2aW91cy5zZWdtZW50KVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKHByZXZpb3VzLm1hdGNoKSB7XHJcbiAgICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KHByZXZpb3VzLm1hdGNoLnNsaWNlKDEsIGkgKyAyKSkgIT09IEpTT04uc3RyaW5naWZ5KG1hdGNoLnNsaWNlKDEsIGkgKyAyKSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGh5ZHJhdGVfdGFyZ2V0KGRlc3QpIHtcclxuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgY29uc3QgeyByb3V0ZSwgcGFnZSB9ID0gZGVzdDtcclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IHBhZ2UucGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgICBsZXQgcmVkaXJlY3QgPSBudWxsO1xyXG4gICAgICAgIGNvbnN0IHByb3BzID0geyBlcnJvcjogbnVsbCwgc3RhdHVzOiAyMDAsIHNlZ21lbnRzOiBbc2VnbWVudHNbMF1dIH07XHJcbiAgICAgICAgY29uc3QgcHJlbG9hZF9jb250ZXh0ID0ge1xyXG4gICAgICAgICAgICBmZXRjaDogKHVybCwgb3B0cykgPT4gZmV0Y2godXJsLCBvcHRzKSxcclxuICAgICAgICAgICAgcmVkaXJlY3Q6IChzdGF0dXNDb2RlLCBsb2NhdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0ICYmIChyZWRpcmVjdC5zdGF0dXNDb2RlICE9PSBzdGF0dXNDb2RlIHx8IHJlZGlyZWN0LmxvY2F0aW9uICE9PSBsb2NhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmZsaWN0aW5nIHJlZGlyZWN0cycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVkaXJlY3QgPSB7IHN0YXR1c0NvZGUsIGxvY2F0aW9uIH07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiAoc3RhdHVzLCBlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJvcHMuZXJyb3IgPSB0eXBlb2YgZXJyb3IgPT09ICdzdHJpbmcnID8gbmV3IEVycm9yKGVycm9yKSA6IGVycm9yO1xyXG4gICAgICAgICAgICAgICAgcHJvcHMuc3RhdHVzID0gc3RhdHVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoIXJvb3RfcHJlbG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJvb3RfcHJlbG9hZCA9IHJvb3RfY29tcC5wcmVsb2FkIHx8ICgoKSA9PiAoe30pKTtcclxuICAgICAgICAgICAgcm9vdF9wcmVsb2FkZWQgPSBpbml0aWFsX2RhdGEucHJlbG9hZGVkWzBdIHx8IHJvb3RfcHJlbG9hZC5jYWxsKHByZWxvYWRfY29udGV4dCwge1xyXG4gICAgICAgICAgICAgICAgaG9zdDogcGFnZS5ob3N0LFxyXG4gICAgICAgICAgICAgICAgcGF0aDogcGFnZS5wYXRoLFxyXG4gICAgICAgICAgICAgICAgcXVlcnk6IHBhZ2UucXVlcnksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9XHJcbiAgICAgICAgICAgIH0sICRzZXNzaW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGJyYW5jaDtcclxuICAgICAgICBsZXQgbCA9IDE7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3Qgc3RyaW5naWZpZWRfcXVlcnkgPSBKU09OLnN0cmluZ2lmeShwYWdlLnF1ZXJ5KTtcclxuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSByb3V0ZS5wYXR0ZXJuLmV4ZWMocGFnZS5wYXRoKTtcclxuICAgICAgICAgICAgbGV0IHNlZ21lbnRfZGlydHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgYnJhbmNoID0geWllbGQgUHJvbWlzZS5hbGwocm91dGUucGFydHMubWFwKChwYXJ0LCBpKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWdtZW50ID0gc2VnbWVudHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocGFydF9jaGFuZ2VkKGksIHNlZ21lbnQsIG1hdGNoLCBzdHJpbmdpZmllZF9xdWVyeSkpXHJcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudF9kaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwcm9wcy5zZWdtZW50c1tsXSA9IHNlZ21lbnRzW2kgKyAxXTsgLy8gVE9ETyBtYWtlIHRoaXMgbGVzcyBjb25mdXNpbmdcclxuICAgICAgICAgICAgICAgIGlmICghcGFydClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBzZWdtZW50IH07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBqID0gbCsrO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZXNzaW9uX2RpcnR5ICYmICFzZWdtZW50X2RpcnR5ICYmIGN1cnJlbnRfYnJhbmNoW2ldICYmIGN1cnJlbnRfYnJhbmNoW2ldLnBhcnQgPT09IHBhcnQuaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50X2JyYW5jaFtpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNlZ21lbnRfZGlydHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgZGVmYXVsdDogY29tcG9uZW50LCBwcmVsb2FkIH0gPSB5aWVsZCBjb21wb25lbnRzW3BhcnQuaV0uanMoKTtcclxuICAgICAgICAgICAgICAgIGxldCBwcmVsb2FkZWQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkgfHwgIWluaXRpYWxfZGF0YS5wcmVsb2FkZWRbaSArIDFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVkID0gcHJlbG9hZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHlpZWxkIHByZWxvYWQuY2FsbChwcmVsb2FkX2NvbnRleHQsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHBhZ2UuaG9zdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHBhZ2UucGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBwYWdlLnF1ZXJ5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJ0LnBhcmFtcyA/IHBhcnQucGFyYW1zKGRlc3QubWF0Y2gpIDoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgJHNlc3Npb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDoge307XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZWQgPSBpbml0aWFsX2RhdGEucHJlbG9hZGVkW2kgKyAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAocHJvcHNbYGxldmVsJHtqfWBdID0geyBjb21wb25lbnQsIHByb3BzOiBwcmVsb2FkZWQsIHNlZ21lbnQsIG1hdGNoLCBwYXJ0OiBwYXJ0LmkgfSk7XHJcbiAgICAgICAgICAgIH0pKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBwcm9wcy5lcnJvciA9IGVycm9yO1xyXG4gICAgICAgICAgICBwcm9wcy5zdGF0dXMgPSA1MDA7XHJcbiAgICAgICAgICAgIGJyYW5jaCA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyByZWRpcmVjdCwgcHJvcHMsIGJyYW5jaCB9O1xyXG4gICAgfSk7XHJcbn1cblxuZnVuY3Rpb24gcHJlZmV0Y2hSb3V0ZXMocGF0aG5hbWVzKSB7XHJcbiAgICByZXR1cm4gcm91dGVzXHJcbiAgICAgICAgLmZpbHRlcihwYXRobmFtZXNcclxuICAgICAgICA/IHJvdXRlID0+IHBhdGhuYW1lcy5zb21lKHBhdGhuYW1lID0+IHJvdXRlLnBhdHRlcm4udGVzdChwYXRobmFtZSkpXHJcbiAgICAgICAgOiAoKSA9PiB0cnVlKVxyXG4gICAgICAgIC5yZWR1Y2UoKHByb21pc2UsIHJvdXRlKSA9PiBwcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChyb3V0ZS5wYXJ0cy5tYXAocGFydCA9PiBwYXJ0ICYmIGNvbXBvbmVudHNbcGFydC5pXS5qcygpKSk7XHJcbiAgICB9KSwgUHJvbWlzZS5yZXNvbHZlKCkpO1xyXG59XG5cbmNvbnN0IHN0b3JlcyQxID0gKCkgPT4gZ2V0Q29udGV4dChDT05URVhUX0tFWSk7XG5cbmV4cG9ydCB7IGdvdG8sIHByZWZldGNoLCBwcmVmZXRjaFJvdXRlcywgc3RhcnQkMSBhcyBzdGFydCwgc3RvcmVzJDEgYXMgc3RvcmVzIH07XG4iLCJpbXBvcnQgKiBhcyBzYXBwZXIgZnJvbSAnQHNhcHBlci9hcHAnO1xuXG5zYXBwZXIuc3RhcnQoe1xuXHR0YXJnZXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzYXBwZXInKVxufSk7Il0sIm5hbWVzIjpbImNvbG9yTmFtZXMiLCJzd2l6emxlIiwiY3NzS2V5d29yZHMiLCJjb252ZXJ0IiwiaW5pdCIsIkVycm9yQ29tcG9uZW50Iiwicm9vdF9jb21wLnByZWxvYWQiLCJzYXBwZXIuc3RhcnQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsSUFBSSxHQUFHLEdBQUc7QUFFbkIsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUMxQjtBQUNBLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxHQUFHO0FBQ3ZCLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixJQUFJLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUlELFNBQVMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDekQsSUFBSSxPQUFPLENBQUMsYUFBYSxHQUFHO0FBQzVCLFFBQVEsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ3pDLEtBQUssQ0FBQztBQUNOLENBQUM7QUFDRCxTQUFTLEdBQUcsQ0FBQyxFQUFFLEVBQUU7QUFDakIsSUFBSSxPQUFPLEVBQUUsRUFBRSxDQUFDO0FBQ2hCLENBQUM7QUFDRCxTQUFTLFlBQVksR0FBRztBQUN4QixJQUFJLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBQ0QsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQ3RC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QztBQUMvQixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7QUFDM0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzNCLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDM0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzNCLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDL0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUM3QixDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ3pCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM5QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDNUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN4QixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FB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QztBQUN4QixDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO0FBQ2hDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDN0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMxQixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzdCLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDMUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM1QixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3hCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDMUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMzQixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FB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SUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUNyRCxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLEVBQUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUMsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hELEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDLENBQUM7QUFDRjtBQUNBLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLFlBQVk7QUFDeEIsQ0FBQyxJQUFJLElBQUksR0FBR0MsYUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CO0FBQ0EsQ0FBQztBQUNELEVBQUUsR0FBRztBQUNMLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDZCxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMxQyxLQUFLLEVBQUUsQ0FBQztBQUNSLEdBQUc7QUFDSCxDQUFDLENBQUM7QUFDRjtBQUNBLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLFlBQVk7QUFDeEIsQ0FBQyxJQUFJLElBQUksR0FBR0EsYUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CO0FBQ0EsQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3hDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRztBQUNoRyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ25ILENBQUMsQ0FBQztBQUNGO0FBQ0EsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLFlBQVk7QUFDaEMsQ0FBQyxJQUFJLElBQUksR0FBR0EsYUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CO0FBQ0EsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDekMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDekMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDekM7QUFDQSxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDeEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJO0FBQzdDLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDaEUsQ0FBQyxDQUFDO0FBQ0Y7QUFDQSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxZQUFZO0FBQ3hCLENBQUMsSUFBSSxJQUFJLEdBQUdBLGFBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDeEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJO0FBQzlELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENB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LEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDM0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMvQixDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzdCLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDekIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzlCLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUM1QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3hCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDckIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUM5QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3hCLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMzQixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzNCLENBQUMsUUFBUSxFQUFFLENBQUMsRUFB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Q0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUNqQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDakMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUNqQyxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzlCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDN0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUN2QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3hCLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDeEIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM5QixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ3hCLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7QUFDaEMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuQixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUM3QixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzFCLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDN0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUMxQixDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDeEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUMxQixDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzNCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7QUFDNUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzdCLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDeEIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM3QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzVCLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDdkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN0QixDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzNCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDeEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM1QixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzFCLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDekIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN6QixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzlCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDeEIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUM5QixDQUFDOzs7QUN2SkQ7QUFDd0M7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUN6QixLQUFLLElBQUksR0FBRyxJQUFJQyxXQUFXLEVBQUU7QUFDN0IsQ0FBQyxJQUFJQSxXQUFXLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3RDLEVBQUUsZUFBZSxDQUFDQSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDMUMsRUFBRTtBQUNGLENBQUM7QUFDRDtBQUNBLElBQUksT0FBTyxHQUFHLGNBQWMsR0FBRztBQUMvQixDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztBQUNsQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztBQUNsQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztBQUNsQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztBQUNsQyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztBQUNwQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztBQUNsQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztBQUNsQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztBQUNsQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDNUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEQsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQUNGO0FBQ0E7QUFDQSxLQUFLLElBQUksS0FBSyxJQUFJLE9BQU8sRUFBRTtBQUMzQixDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNwQyxFQUFFLElBQUksRUFBRSxVQUFVLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDdkMsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQzFELEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxFQUFFLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNyQyxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDaEUsR0FBRztBQUNIO0FBQ0EsRUFBRSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDaEUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2xFLEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN6QyxFQUFFLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDckMsRUFBRSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDakMsRUFBRSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDL0IsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUN2RSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ25FLEVBQUU7QUFDRixDQUFDO0FBQ0Q7QUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUNqQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QixDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QixDQUFDLElBQUksS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDdkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1A7QUFDQSxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsRUFBRTtBQUNsQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDUixFQUFFLE1BQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ3ZCLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUM7QUFDdEIsRUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUN2QixFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztB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QUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ3RFO0FBQ0EsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztBQUNwRCxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ3BELENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDcEQ7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtB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Q0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2QixDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkIsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtBQUNBO0FBQ0EsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDaEIsRUFBRSxFQUFFLElBQUksS0FBSyxDQUFDO0FBQ2QsRUFBRSxFQUFFLElBQUksS0FBSyxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNaLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2Y7QUFDQSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRTtBQUN2QixFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1osRUFBRTtBQUNGO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdkI7QUFDQSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLFFBQVEsQ0FBQztBQUNWLEVBQUUsUUFBUTtBQUNWLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDVCxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU07QUFDdEMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNO0FBQ3RDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUN0QyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDdEMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ3RDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUN0QyxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxJQUFJLEVBQUU7QUFDbkMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2QixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEM7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDdEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1A7QUFDQSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEQsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ2pEO0FBQ0E7QUFDQSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUztBQUNsQixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxLQUFLO0FBQzdDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNkO0FBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVM7QUFDbEIsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksS0FBSztBQUM3QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDZDtBQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTO0FBQ2xCLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEtBQUs7QUFDN0MsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ2Q7QUFDQSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFD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QUM7QUFDdEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEI7QUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUNGO0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsVUFBVSxJQUFJLEVBQUU7QUFDckMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RTtBQUNBLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDO0FBQ0EsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDbEIsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUNaLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUNkLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQzlCLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6QjtBQUNBLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2xCLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNiLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFVBQVUsSUFBSSxFQUFFO0FBQ3JDO0FBQ0E7QUFDQSxDQUFDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsQ0FBQyxDQUFDO0FBQ0Y7QUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQUksRUFBRTtBQUN0QyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQjtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2IsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUNiLEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQ2YsR0FBRyxPQUFPLEdBQUcsQ0FBQztBQUNkLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDaEQsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFO0FBQ2QsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QjtBQUNBLENBQUMsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBSSxFQUFFO0FBQ3JDLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN2QjtBQUNBO0FBQ0EsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNqQyxFQUFFLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRTtBQUNqQixHQUFHLEtBQUssSUFBSSxHQUFHLENBQUM7QUFDaEIsR0FBRztBQUNIO0FBQ0EsRUFBRSxLQUFLLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDN0I7QUFDQSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9CLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDdEMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDO0FBQ3BDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQztBQUMzQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtB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QUUsS0FBSyxDQUFDO0FBQ1IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ2hELEVBQUUsS0FBSyxDQUFDO0FBQ1IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ2hELEVBQUUsS0FBSyxDQUFDO0FBQ1IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ2hELEVBQUUsS0FBSyxDQUFDO0FBQ1IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ2hELEVBQUU7QUFDRixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QyxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCO0FBQ0EsQ0FBQyxPQUFPO0FBQ1IsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJ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RyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYO0FBQ0EsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDWixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUM7QUFDRjtBQUNBLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQ3JDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUM7QUFDdkYsQ0FBQyxDQUFDO0FBQ0Y7QUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUNuQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxD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Q0g7QUFDQSxFQUFFLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRTtBQUN4QixJQUFJLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtBQUMxQixNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyRixLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN2QixHQUFHO0FBQ0g7QUFDQTtBQUNBLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDO0FBQ0EsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRTtBQUNyRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUNyQyxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekM7QUFDQSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0MsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDO0FBQ0EsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQztBQUNBLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEM7QUFDQSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEM7QUFDQSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUss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QztBQUNsQyxJQUFJLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM1QixJQUFJLElBQUksQ0FBQyxHQUFHLE1BQU0sS0FBSyxTQUFTLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUNoRDtBQUNBLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsSUFBSSxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVDO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUNwRSxJQUFJLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEI7QUFDQSxJQUFJLE9BQU8sS0FBSyxDQUFDLEdBQUc7QUFDcEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQzNDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUMvQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDN0MsTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELEtBQUssQ0FBQztBQUNOLEdBQUc7QUFDSCxDQUFDLENBQUM7QUFDRjtBQUNBO0FBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQ0Es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
