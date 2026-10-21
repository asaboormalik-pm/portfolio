// Seed content extracted from the original static page (abdul-saboor-portfolio_3.html).
// After seeding, the Owner Console is the source of truth — edit there, not here.

export const seedSections = [
  {
    "label": "Availability & inventory",
    "shortLabel": "Availability",
    "blurb": "Before anything can be promised, the business has to know what it actually has, where it sits, and who it belongs to.",
    "projects": [
      {
        "code": "INV-01 · built from zero",
        "title": "Inventory management system for a marketplace",
        "context": "GCC omni-channel retail marketplace · Senior PM, fulfillment technology",
        "situation": "A marketplace lets several sellers list the same product from different locations. Treating a SKU as the unit of inventory breaks immediately.",
        "task": "Give the platform a single inventory model that could say whose stock had just sold, and which warehouse owed the customer — built from zero.",
        "action": [
          "Defined an offer-level identity model — product, supplier and location combined into one key — so the same SKU could be listed by multiple sellers without collision.",
          "Modelled stock movement as a transaction ledger: receipts, issues, transfers and adjustments, each with a reason code, rather than mutating a quantity field.",
          "Set the system up as the single source of truth other systems subscribe to, instead of one more integration in a mesh."
        ],
        "result": "Shipped as the inventory backbone for the marketplace, adopted by every downstream service.",
        "metrics": [
          {
            "value": "Zero → One",
            "label": "Platform inventory backbone built from scratch",
            "signal": true
          },
          {
            "value": "Real-time",
            "label": "Positions replace periodic file syncs",
            "signal": true
          }
        ],
        "tags": [
          "Data modelling",
          "Systems design",
          "Marketplace",
          "Zero to one"
        ]
      },
      {
        "code": "INV-02",
        "title": "Availability, allocation and reservation",
        "context": "GCC omni-channel retail marketplace · Senior PM, fulfillment technology",
        "situation": "Overselling and stockouts are the same failure seen from two sides: the number the storefront shows is not the number the warehouse can actually pick.",
        "task": "Converge storefront and warehouse reality in real time, while still letting the business ring-fence stock for campaigns and priority orders.",
        "action": [
          "Specified a global available-to-promise calculation covering every location and every offer, exposed in real time.",
          "Added rule-based ring-fencing so stock could be held back for flash sales, priority orders or campaigns without cloning inventory records.",
          "Designed a two-step reservation handshake — soft at order creation, hard on warehouse acceptance — with time and event-based release so abandoned carts return stock automatically."
        ],
        "result": "Storefront availability and warehouse reality converged, and campaign stock could be committed without ever being taken off sale.",
        "metrics": [
          {
            "value": "Global ATP",
            "label": "Every location, every offer, live",
            "signal": true
          },
          {
            "value": "2-step reserve",
            "label": "Soft at order, hard at acceptance",
            "signal": true
          }
        ],
        "tags": [
          "Real-time systems",
          "ATP",
          "Edge cases",
          "Commercial trade-offs"
        ]
      },
      {
        "code": "INV-03",
        "title": "One inventory picture across five source types",
        "context": "GCC omni-channel retail marketplace · Senior PM, fulfillment technology",
        "situation": "Stock lived in a third-party logistics provider, owned warehouses, retail back rooms and seller systems — each with its own schema, cadence and definition of \"available\".",
        "task": "Harmonise five source types into one inventory picture, sequenced so the roadmap didn't stall on the slowest integration.",
        "action": [
          "Built an integration layer that harmonised roughly forty inventory attributes into one model, marking each field mandatory or optional by source.",
          "Chose publish-subscribe over point-to-point so order management, cart and search consumed one feed rather than four.",
          "Sequenced the rollout by source type, deliberately taking the third-party provider first because it was the only one already API-addressable."
        ],
        "result": "Unlocked fulfilled-from-store and fulfilled-by-platform models that had been blocked on inventory visibility.",
        "metrics": [
          {
            "value": "~40",
            "label": "Inventory attributes harmonised"
          },
          {
            "value": "5",
            "label": "Source types, one inventory picture"
          }
        ],
        "tags": [
          "Integration architecture",
          "Phased delivery",
          "Dependency management"
        ]
      }
    ]
  },
  {
    "label": "Production & warehouse",
    "shortLabel": "Production",
    "blurb": "The floor is where cost per order is actually won or lost — in labour minutes, walking distance, and how often something has to be done twice.",
    "projects": [
      {
        "code": "PRD-01 · flagship",
        "title": "Build-to-order fulfillment",
        "context": "European meal-kit business, three continents · Product lead, supply chain technologies",
        "situation": "Under a build-to-stock model, every additional menu option needs its own pre-built inventory and its own share of finite line capacity.",
        "task": "Remove the ceiling on menu size — the company's main growth lever — without a capital-expenditure fix.",
        "action": [
          "Reframed the constraint: the ceiling was in the fulfillment model, not the buildings, so the fix belonged in production software rather than capital expenditure.",
          "Designed the production capability to assemble to the order instead of drawing from pre-built stock, and worked through what that changed for picking, sequencing and quality control.",
          "Delivered against live sites, where the cost of getting it wrong is measured in missed customer boxes."
        ],
        "result": "Menu expansion decoupled from line capacity for good — production software absorbed the growth the buildings couldn't.",
        "metrics": [
          {
            "value": "#1 objective",
            "label": "Adopted company-wide, top of the roadmap",
            "signal": true
          },
          {
            "value": "Top-line",
            "label": "Direct contribution to growth",
            "signal": true
          }
        ],
        "tags": [
          "Strategy",
          "Constraint reframing",
          "Operating model change",
          "Executive alignment"
        ]
      },
      {
        "code": "PRD-02",
        "title": "Production control system and floor tooling",
        "context": "European meal-kit business, three continents · Product lead, supply chain technologies",
        "situation": "Distribution centres on three continents run the same product on different building shapes, labour markets and volumes.",
        "task": "Own one roadmap that works everywhere, without letting it collapse into unmaintainable per-site software.",
        "action": [
          "Own the roadmap for the production control system and the tools around it — picking applications, quality control, electronic shelf labels for replenishment and pick accuracy, and production dashboards for site leadership.",
          "Hold the roadmap against four operating metrics: labour minutes per box, error rate, boxes per hour, and how far the menu can scale.",
          "Draw the line between what must be global and what sites configure themselves, deliberately, rather than letting it be settled by whoever escalates loudest."
        ],
        "result": "A single production platform now runs across three continents, with every launch instrumented against a floor metric from day one.",
        "metrics": [
          {
            "value": "3",
            "label": "Continents, one production platform"
          },
          {
            "value": "4",
            "label": "Floor metrics every launch is held to"
          }
        ],
        "tags": [
          "Platform strategy",
          "Labour efficiency",
          "Global rollout",
          "Operational KPIs"
        ]
      },
      {
        "code": "WMS-01 · built from zero",
        "title": "Omni-channel warehouse management system",
        "context": "GCC omni-channel retail marketplace · Senior PM, fulfillment technology",
        "situation": "Off-the-shelf warehouse systems assume an order is fulfilled from one warehouse. This business had staked itself on orders assembled from stores, warehouses and partners at once.",
        "task": "Decide build versus buy, then deliver the full process — receiving through returns — designed backwards from the customer's cut-off, not a demo environment.",
        "action": [
          "Made and documented the build-versus-buy case, including what buying would have bought us and why the hypothesis was too unproven to justify the price.",
          "Defined the full process scope — receiving, quality check, putaway, replenishment, picking, consolidation, packing, sortation, dispatch and returns — across fulfillment centres, delivery stations, retail stores and bonded cross-border sites.",
          "Planned execution backwards from the critical pull time, so the system scheduled every upstream step against the cut-off and flagged delays before they reached the customer.",
          "Cut hardware cost by specifying consumer devices with clip-on infrared scanners in place of industrial handhelds."
        ],
        "result": "Shipped as a mobile app for the floor and a web console for warehouse managers, API-first so third-party hardware and software could attach.",
        "metrics": [
          {
            "value": "1.5K/day",
            "label": "Orders at design point"
          },
          {
            "value": "500K",
            "label": "Items in storage"
          },
          {
            "value": "99.5%",
            "label": "Delivered in full & on time"
          },
          {
            "value": "<24h",
            "label": "Fulfillment turnaround"
          }
        ],
        "tags": [
          "Build vs buy",
          "WMS",
          "Process design",
          "Hardware strategy",
          "Chain of custody"
        ]
      },
      {
        "code": "WMS-02",
        "title": "Fulfillment technology across 80+ sites",
        "context": "Regional grocery and hypermarket operator, MENA · Product manager, logistics",
        "situation": "Technology that works in a pilot warehouse routinely fails at the fiftieth, where the building is older, the team is newer, and nobody was in the room when it was designed.",
        "task": "Roll out fulfillment technology across more than eighty sites, including automated warehouses, without repeating the pilot's assumptions.",
        "action": [
          "Directed rollout of fulfillment technology across more than eighty sites, including automated warehouses.",
          "Paired every deployment with performance management tooling, so sites could see their own numbers rather than hear about them a month later."
        ],
        "result": "Every site got performance tooling that showed its own numbers, not a monthly report from head office.",
        "metrics": [
          {
            "value": "80+",
            "label": "Sites deployed"
          },
          {
            "value": "+11%",
            "label": "On-time-in-full"
          },
          {
            "value": "+27%",
            "label": "Fleet utilisation"
          }
        ],
        "tags": [
          "Scaled rollout",
          "Change management",
          "Automation",
          "Performance tooling"
        ]
      },
      {
        "code": "WMS-03 · hands-on build",
        "title": "AI-native warehouse and receiving applications",
        "context": "Enterprise supply chain clients, Europe · Forward deployed engineer",
        "situation": "Mid-size operators need warehouse software shaped to their ERP and their process, but cannot fund a conventional build cycle to get it.",
        "task": "Own product definition, architecture, interface and implementation, and ship the working system — not a prototype handed off to someone else.",
        "action": [
          "Owned product definition, solution architecture, interface design and implementation — not a prototype handed off, but the working system.",
          "Used agentic development tooling to compress the cycle while holding enterprise integration and quality standards."
        ],
        "result": "ERP-integrated warehouse management and inventory receiving applications running in live operations, not pilots.",
        "metrics": [
          {
            "value": "Multi-country",
            "label": "Live in production for clients in several countries",
            "signal": true
          },
          {
            "value": "Agentic build",
            "label": "Compressed cycle, enterprise-grade integration",
            "signal": true
          }
        ],
        "tags": [
          "Zero to one",
          "Solution architecture",
          "AI-assisted delivery",
          "ERP integration"
        ]
      }
    ]
  },
  {
    "label": "Promise & planning",
    "shortLabel": "Promise",
    "blurb": "The delivery date shown at checkout is the most consequential number in e-commerce. It sets the customer's expectation and commits the network to meeting it.",
    "projects": [
      {
        "code": "PRM-01",
        "title": "Dynamic delivery promise",
        "context": "Omnichannel retail group, MENA · Senior PM, e-commerce supply chain",
        "situation": "A fixed delivery promise is wrong twice over: too cautious for customers near a stocked warehouse, too optimistic for everyone else.",
        "task": "Build the promise from live signals — stock location, fulfilling site, reachable cut-off, customer location — instead of a static table.",
        "action": [
          "Built the promise from real signals — where the stock is, which site can fulfil, the cut-off still reachable, and the customer's actual location — rather than a static table.",
          "Added location intelligence to improve address accuracy in a region where addressing is genuinely hard."
        ],
        "result": "The promise shown at checkout finally matched what the network could actually deliver.",
        "metrics": [
          {
            "value": "+14%",
            "label": "Same/next-day availability"
          },
          {
            "value": "-4.7%",
            "label": "Failed deliveries"
          },
          {
            "value": "+0.7",
            "label": "NPS"
          }
        ],
        "tags": [
          "Delivery promise",
          "Location intelligence",
          "Conversion",
          "Cost to serve"
        ]
      },
      {
        "code": "PRM-02",
        "title": "Network planning and distribution optimization",
        "context": "GCC omni-channel retail marketplace · Senior PM, fulfillment technology",
        "situation": "A mixed fleet of owned drivers and third-party carriers, planned by hand, cannot be reasoned about — you can see the cost but not which decision caused it.",
        "task": "Own the planning platform end to end and make service level, promise accuracy and cost per order steerable rather than emergent.",
        "action": [
          "Owned the planning platform end to end: routing, delivery zones, capacity planning and slot optimization.",
          "Worked directly with engineering on the optimization approach and, more importantly, on the operational constraints it had to respect to be usable."
        ],
        "result": "Service levels, promise accuracy and cost per order became measurable and steerable rather than emergent.",
        "metrics": [
          {
            "value": "Steerable",
            "label": "Service level, promise accuracy, cost/order",
            "signal": true
          }
        ],
        "tags": [
          "Network optimization",
          "Routing",
          "Capacity planning",
          "3PL"
        ]
      }
    ]
  },
  {
    "label": "Last mile & peak",
    "shortLabel": "Last mile",
    "blurb": "The only part of fulfillment the customer sees — and the part that breaks first when volume spikes.",
    "projects": [
      {
        "code": "LM-01",
        "title": "Last-mile platform suite across 11 countries",
        "context": "Regional grocery and hypermarket operator, MENA · Product manager, logistics",
        "situation": "Eleven countries, each with its own carriers, licensed tooling and definition of a delivery — and a growing subscription bill for software that did not talk to itself.",
        "task": "Replace fragmented licensed tooling with one connected suite spanning carrier management, delivery management, promise and tracking.",
        "action": [
          "Led development of carrier management, delivery management, delivery promise and customer order tracking as one connected suite.",
          "Built predictive analytics and routing optimization on top, so planning improved as the data accumulated."
        ],
        "result": "Licensed point tools retired in favour of one connected suite, with a better tracking experience on top.",
        "metrics": [
          {
            "value": "11",
            "label": "Countries deployed"
          },
          {
            "value": "AED 4.8M",
            "label": "Annual savings vs. licensed tools"
          }
        ],
        "tags": [
          "Multi-country",
          "Carrier management",
          "Cost reduction",
          "Predictive analytics"
        ]
      },
      {
        "code": "LM-02",
        "title": "Peak trading at four times volume",
        "context": "Omnichannel retail group, MENA · Senior PM, e-commerce supply chain",
        "situation": "The region's largest trading event compresses a month of orders into days. Everything merely adequate in a normal week fails, and fails in public.",
        "task": "Design backwards from the volume the network had to survive, and own readiness and launch execution end to end.",
        "action": [
          "Owned platform readiness and launch execution end to end, working backwards from the volume the network had to survive.",
          "Treated the constraint as the design input rather than testing against normal load and hoping."
        ],
        "result": "The network held through the region's single largest trading event without visible strain.",
        "metrics": [
          {
            "value": "4X",
            "label": "Normal transaction volume sustained"
          },
          {
            "value": "Held the line",
            "label": "No service degradation at peak",
            "signal": true
          }
        ],
        "tags": [
          "Peak readiness",
          "Launch execution",
          "Scale testing"
        ]
      }
    ]
  },
  {
    "label": "Returns",
    "shortLabel": "Returns",
    "blurb": "Reverse logistics is where customer trust is either repaired or lost for good, and it is almost always the least designed part of the chain.",
    "projects": [
      {
        "code": "RET-01",
        "title": "Returns and order journey redesign",
        "context": "Omnichannel retail group, MENA · Senior PM, e-commerce supply chain",
        "situation": "A three-day refund turnaround generates a contact for every return. The customer isn't chasing money so much as chasing certainty.",
        "task": "Redesign returns, address management and order journeys as one flow, and attack the refund timeline itself rather than add status messaging on top.",
        "action": [
          "Redesigned returns, address management and order journeys across web and mobile as one flow rather than three screens.",
          "Attacked the refund timeline itself instead of adding status messaging on top of a slow process."
        ],
        "result": "Customers stopped chasing status updates because the refund itself arrived before they needed to ask.",
        "metrics": [
          {
            "value": "72h → <24h",
            "label": "Refund turnaround"
          },
          {
            "value": "-11%",
            "label": "Customer contacts"
          }
        ],
        "tags": [
          "Reverse logistics",
          "Customer experience",
          "Web & mobile",
          "Contact reduction"
        ]
      }
    ]
  },
  {
    "label": "Off the line",
    "shortLabel": "Off the line",
    "blurb": "Work that sits outside the order path, where the same instincts apply to a different problem.",
    "projects": [
      {
        "code": "PLT-01 · advisory",
        "title": "B2B marketplace with embedded finance",
        "context": "Stealth startup, GCC · Fractional chief product officer",
        "situation": "Small hospitality businesses buy supplies constantly and are financed badly. The procurement problem and the credit problem are the same problem.",
        "task": "Define product vision, marketplace strategy and commercial model as fractional CPO, and embed financing directly inside the buying flow.",
        "action": [
          "Defined product vision, marketplace strategy, customer journeys and the commercial model.",
          "Integrated multiple financing providers so credit and working capital appear inside the buying flow rather than beside it."
        ],
        "result": "Roadmap shaped from concept to launch, with a path into adjacent verticals once the model is proven.",
        "metrics": [
          {
            "value": "Concept → launch",
            "label": "Roadmap shaped end to end",
            "signal": true
          }
        ],
        "tags": [
          "Marketplace strategy",
          "Embedded finance",
          "Commercial modelling",
          "Founder advisory"
        ]
      }
    ]
  }
] as const;
