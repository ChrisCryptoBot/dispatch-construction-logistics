# Feature-by-Feature UI Audit & Enhancement Plan
**Superior One Logistics Platform**
*Complete Navigation & Page-Level Review for Carrier & Customer Roles*

---

## 📋 Executive Summary

This document provides a **detailed feature-by-feature audit** of every page accessible from both the Carrier and Customer sidebar navigation, along with specific UI enhancement recommendations for each feature.

### Navigation Structure

**Carrier Role** - 12 Main Features
**Customer Role** - 10 Main Features
**Shared Components** - Header, Messaging, Notifications

---

# 🚛 CARRIER ROLE FEATURES

## Navigation Overview (S1Sidebar)

```
┌─ S1Sidebar (Collapsible: 280px → 80px)
├─ Logo Section: "SUPERIOR ONE" (skewed transform effect)
├─ Navigation Items (12):
│  ├─ Dashboard (/carrier-dashboard)
│  ├─ Load Board (/loads)
│  ├─ My Loads (/my-loads)
│  ├─ Drivers (/drivers)
│  ├─ Fleet (/fleet)
│  ├─ Dispatch Command Center (/dispatch)
│  ├─ Scale Tickets (/scale-tickets)
│  ├─ BOL Templates (/bol-templates)
│  ├─ Documents (/documents)
│  ├─ Factoring (/factoring)
│  ├─ Invoices (/invoices)
│  └─ Compliance (/compliance)
├─ Quick Filters (Active, Pending, In Transit, Delivered)
└─ Collapse Toggle Button
```

---

## 1. Carrier Dashboard (/carrier-dashboard)

### Current Features:
- **Stats Cards**: Active Loads, Available Loads, Completed Today, Revenue, Fleet Utilization, On-Time Delivery
- **Driver Status Overview**: Real-time driver locations, HOS tracking
- **Recent Loads**: Load cards with status
- **Timezone Selector**: US timezone dropdown
- **Live Clock**: Real-time clock display
- **Quick Actions**: Navigation to key features

### Current UI Strengths:
✅ AnimatedCounter for metrics
✅ Card-based layout
✅ Color-coded status indicators
✅ Icon-based navigation
✅ Timezone awareness

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Enhanced Stat Cards
```typescript
// Replace basic cards with gradient-bordered premium cards
<EnhancedCard
  variant="glass"
  hover
  className="gradient-border card-elevated-3"
>
  <div className="flex justify-between items-start">
    <div>
      <p className="text-fluid-sm text-text-tertiary uppercase tracking-widest">
        Active Loads
      </p>
      <AnimatedCounter
        value={stats.activeLoads}
        className="text-fluid-3xl text-gradient-brand font-bold"
      />
      <p className="text-xs text-success flex items-center gap-1 mt-2">
        <TrendingUp size={14} />
        +12% vs last week
      </p>
    </div>
    <div className="neomorphic-button p-4 glow-red-hover">
      <Truck size={32} className="text-accent-primary" />
    </div>
  </div>
</EnhancedCard>
```

#### 🎨 Priority 2: Driver Status Cards Enhancement
- **Add**: Live GPS tracking indicators (pulsing dot)
- **Add**: HOS visualization (circular progress)
- **Add**: One-tap quick actions (Call, Message, Track)
- **Visual**: Duotone gradient overlays for driver avatars

```typescript
<div className="driver-card glass-card lift-on-hover">
  <div className="flex items-center gap-3">
    {/* Driver Avatar with Status */}
    <div className="relative">
      <div className="w-12 h-12 rounded-full duotone-image">
        <img src={driver.avatar} alt={driver.name} />
      </div>
      {/* Live indicator */}
      <div className="absolute -top-1 -right-1">
        <span className="flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
        </span>
      </div>
    </div>

    {/* Driver Info */}
    <div className="flex-1">
      <h4 className="font-semibold text-text-primary">{driver.name}</h4>
      <p className="text-sm text-text-tertiary">{driver.location}</p>
    </div>

    {/* HOS Circular Progress */}
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="rgba(197, 48, 48, 0.1)" strokeWidth="6" fill="none" />
        <circle
          cx="32" cy="32" r="28"
          stroke="#C53030"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${(driver.hosRemaining / 11) * 175.93} 175.93`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{driver.hosRemaining}h</span>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="flex gap-2">
      <button className="p-2 rounded-lg hover:bg-bg-hover transition-all">
        <Phone size={16} />
      </button>
      <button className="p-2 rounded-lg hover:bg-bg-hover transition-all">
        <MessageSquare size={16} />
      </button>
    </div>
  </div>
</div>
```

#### 🎨 Priority 3: Revenue Card with Chart
- **Add**: Mini sparkline chart showing weekly revenue trend
- **Add**: Animated currency counting with rolling numbers
- **Visual**: Gradient background with subtle duotone overlay

#### 🎨 Priority 4: Quick Action Grid
- **Add**: Floating action button (FAB) for "Post Available Truck"
- **Add**: Quick shortcuts to frequently used features
- **Visual**: Glass morphism buttons with hover glow

---

## 2. Load Board (/loads)

### Current Features:
- Load listings with filters
- Search functionality
- Status filtering
- Distance/rate sorting

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Map View Toggle
```typescript
<div className="flex gap-4 mb-6">
  <div className="flex bg-bg-secondary rounded-xl p-1">
    <button
      className={`px-4 py-2 rounded-lg transition-all ${
        view === 'list'
          ? 'bg-accent-primary text-white shadow-lg'
          : 'text-text-secondary hover:text-text-primary'
      }`}
      onClick={() => setView('list')}
    >
      <List size={20} />
    </button>
    <button
      className={`px-4 py-2 rounded-lg transition-all ${
        view === 'map'
          ? 'bg-accent-primary text-white shadow-lg'
          : 'text-text-secondary hover:text-text-primary'
      }`}
      onClick={() => setView('map')}
    >
      <Map size={20} />
    </button>
  </div>
</div>
```

#### 🎨 Priority 2: Enhanced Load Cards
- **Add**: Equipment type badges with icons
- **Add**: Rate comparison indicator ("Above avg +15%")
- **Add**: Estimated deadhead distance
- **Visual**: Duotone gradient for high-value loads

```typescript
<div className="glass-card lift-on-hover card-elevated-2 relative overflow-hidden">
  {/* High-value indicator */}
  {load.rate > avgRate * 1.2 && (
    <div className="absolute top-0 right-0">
      <div className="bg-gradient-to-bl from-yellow-400 to-transparent w-20 h-20" />
      <Star className="absolute top-2 right-2 text-yellow-300" size={20} />
    </div>
  )}

  <div className="space-y-4">
    {/* Route Header */}
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-fluid-lg font-semibold flex items-center gap-2">
          <MapPin size={18} className="text-success" />
          {load.origin}
        </h3>
        <div className="flex items-center gap-2 text-text-tertiary text-sm mt-1">
          <ArrowDown size={14} />
          <span>{load.distance} miles</span>
        </div>
        <h3 className="text-fluid-lg font-semibold flex items-center gap-2 mt-1">
          <MapPin size={18} className="text-danger" />
          {load.destination}
        </h3>
      </div>

      {/* Rate Card */}
      <div className="duotone-subtle-bg rounded-xl p-4 text-right">
        <p className="text-text-tertiary text-xs uppercase tracking-wider">Rate</p>
        <p className="text-fluid-2xl font-bold text-gradient-success">
          {formatCurrency(load.rate)}
        </p>
        {load.ratePerMile && (
          <p className="text-xs text-text-secondary mt-1">
            ${load.ratePerMile}/mi
          </p>
        )}
      </div>
    </div>

    {/* Equipment & Details */}
    <div className="flex flex-wrap gap-2">
      <Badge variant="equipment" icon={<Truck size={14} />}>
        {load.equipmentType}
      </Badge>
      <Badge variant="weight">
        {formatNumber(load.weight)} lbs
      </Badge>
      <Badge variant="commodity">
        {load.commodityType}
      </Badge>
    </div>

    {/* Pickup/Delivery Times */}
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-text-tertiary">Pickup</p>
        <p className="font-semibold text-text-primary">
          {formatDate(load.pickupDate)}
        </p>
      </div>
      <div>
        <p className="text-text-tertiary">Delivery</p>
        <p className="font-semibold text-text-primary">
          {formatDate(load.deliveryDate)}
        </p>
      </div>
    </div>

    {/* Actions */}
    <button className="w-full glass-button-primary glow-red-hover ripple-effect">
      <span>Book Load</span>
      <ArrowRight size={18} />
    </button>
  </div>
</div>
```

#### 🎨 Priority 3: Advanced Filters Drawer
- **Add**: Slide-out filter panel with glass morphism
- **Add**: Saved filter presets
- **Add**: Real-time filter count indicator

---

## 3. My Loads (/my-loads)

### Current Features:
- Active load tracking
- Load history
- Status updates
- Document access

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Kanban Board View
```typescript
// Add drag-and-drop Kanban board
<div className="grid grid-cols-4 gap-4">
  {['Booked', 'In Transit', 'At Delivery', 'Completed'].map(status => (
    <div key={status} className="glass-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{status}</h3>
        <Badge>{loads.filter(l => l.status === status).length}</Badge>
      </div>
      <div className="space-y-3">
        {loads.filter(l => l.status === status).map(load => (
          <LoadCard key={load.id} load={load} compact />
        ))}
      </div>
    </div>
  ))}
</div>
```

#### 🎨 Priority 2: Timeline View
- **Add**: Vertical timeline showing load progression
- **Add**: Milestone indicators with timestamps
- **Visual**: Animated progress line with gradient

#### 🎨 Priority 3: Quick Actions Bar
- **Add**: Floating action bar at bottom with common actions
- **Add**: Multi-select for batch operations
- **Add**: Export to CSV/PDF options

---

## 4. Drivers (/drivers)

### Current Features:
- Driver roster
- Status tracking
- Contact information
- Assignment history

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Driver Dashboard Cards
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {drivers.map(driver => (
    <EnhancedCard key={driver.id} hover className="gradient-border">
      {/* Driver Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <img
            src={driver.avatar}
            className="w-20 h-20 rounded-full object-cover duotone-image"
          />
          <StatusDot status={driver.status} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{driver.name}</h3>
          <p className="text-sm text-text-tertiary">{driver.cdlNumber}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={driver.status}>{driver.status}</Badge>
          </div>
        </div>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatBadge label="Loads" value={driver.totalLoads} />
        <StatBadge label="Miles" value={formatNumber(driver.totalMiles)} />
        <StatBadge label="Rating" value={`${driver.rating}/5`} icon={<Star />} />
      </div>

      {/* HOS Status */}
      <div className="bg-bg-tertiary rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-tertiary">Hours Available</span>
          <span className="text-sm font-bold">{driver.hosAvailable}h / 11h</span>
        </div>
        <ProgressBar
          value={(driver.hosAvailable / 11) * 100}
          className="h-2"
          variant="gradient"
        />
      </div>

      {/* Current Assignment */}
      {driver.currentLoad && (
        <div className="bg-accent-subtle rounded-lg p-3 mb-4">
          <p className="text-xs text-text-tertiary mb-1">Current Load</p>
          <p className="font-semibold text-sm">
            {driver.currentLoad.origin} → {driver.currentLoad.destination}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            ETA: {formatTime(driver.currentLoad.eta)}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button className="flex-1 glass-button-secondary">
          <Phone size={16} />
          <span>Call</span>
        </button>
        <button className="flex-1 glass-button-secondary">
          <MessageSquare size={16} />
          <span>Message</span>
        </button>
        <button className="flex-1 glass-button-secondary">
          <MapPin size={16} />
          <span>Track</span>
        </button>
      </div>
    </EnhancedCard>
  ))}
</div>
```

#### 🎨 Priority 2: Driver Performance Dashboard
- **Add**: Performance metrics charts (on-time %, safety score)
- **Add**: Earnings breakdown by week/month
- **Visual**: Gradient charts with duotone overlays

#### 🎨 Priority 3: Shift Calendar
- **Add**: Monthly calendar view showing driver schedules
- **Add**: Drag-and-drop shift assignment
- **Add**: Color-coded availability indicators

---

## 5. Fleet (/fleet)

### Current Features:
- Vehicle roster
- Maintenance tracking
- Equipment assignments
- Status monitoring

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Fleet Overview Dashboard
```typescript
<div className="space-y-6">
  {/* Fleet Health Summary */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <StatCard
      title="Active Units"
      value={fleet.active}
      total={fleet.total}
      icon={<Truck />}
      trend="+5%"
      className="gradient-border"
    />
    <StatCard
      title="In Maintenance"
      value={fleet.maintenance}
      icon={<Wrench />}
      variant="warning"
    />
    <StatCard
      title="Available"
      value={fleet.available}
      icon={<CheckCircle />}
      variant="success"
    />
    <StatCard
      title="Utilization"
      value={`${fleet.utilization}%`}
      icon={<Activity />}
      progress={fleet.utilization}
    />
  </div>

  {/* Fleet List with Equipment Cards */}
  <div className="glass-card">
    <div className="flex justify-between items-center p-6 border-b border-border-subtle">
      <h2 className="text-xl font-bold">Fleet Roster</h2>
      <div className="flex gap-2">
        <button className="glass-button-secondary">
          <Filter size={18} />
          Filter
        </button>
        <button className="glass-button-primary">
          <PlusCircle size={18} />
          Add Vehicle
        </button>
      </div>
    </div>

    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onAction={(action) => handleVehicleAction(vehicle.id, action)}
          />
        ))}
      </div>
    </div>
  </div>
</div>
```

#### 🎨 Priority 2: Maintenance Calendar
- **Add**: Visual maintenance schedule with color coding
- **Add**: Overdue maintenance alerts (animated)
- **Add**: Quick-schedule maintenance modal

#### 🎨 Priority 3: Vehicle Tracking Map
- **Add**: Real-time GPS tracking on interactive map
- **Add**: Geofence indicators
- **Add**: Route history playback

---

## 6. Dispatch Command Center (/dispatch)

### Current Features:
- Real-time load tracking
- Driver assignment
- Route optimization
- Communication hub

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Mission Control Dashboard
```typescript
<div className="h-screen flex flex-col">
  {/* Top Command Bar */}
  <div className="glass-card p-4 flex justify-between items-center">
    <div className="flex gap-4">
      <StatusIndicator label="Active Loads" value={dispatched.active} status="success" />
      <StatusIndicator label="Unassigned" value={dispatched.unassigned} status="warning" />
      <StatusIndicator label="Delayed" value={dispatched.delayed} status="danger" />
    </div>
    <div className="flex gap-2">
      <button className="glass-button-secondary">
        <RefreshCw size={18} />
        Refresh
      </button>
      <button className="glass-button-primary">
        <Zap size={18} />
        Auto-Assign
      </button>
    </div>
  </div>

  {/* Main Content Area */}
  <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
    {/* Left: Unassigned Loads Queue */}
    <div className="glass-card p-4 overflow-y-auto">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Clock size={20} />
        Unassigned Loads
        <Badge>{unassignedLoads.length}</Badge>
      </h3>
      <div className="space-y-3">
        {unassignedLoads.map(load => (
          <LoadQueueCard
            key={load.id}
            load={load}
            draggable
            onDragStart={() => setDraggingLoad(load)}
          />
        ))}
      </div>
    </div>

    {/* Middle: Driver Grid */}
    <div className="col-span-2 glass-card p-4 overflow-y-auto">
      <h3 className="font-bold mb-4">Available Drivers</h3>
      <div className="grid grid-cols-2 gap-3">
        {availableDrivers.map(driver => (
          <DriverDispatchCard
            key={driver.id}
            driver={driver}
            onDrop={(load) => assignLoadToDriver(load, driver)}
            acceptsDrop={draggingLoad !== null}
          />
        ))}
      </div>
    </div>
  </div>
</div>
```

#### 🎨 Priority 2: Live Map View
- **Add**: Split-screen with map on left, load list on right
- **Add**: Driver location dots with status colors
- **Add**: Route lines with ETA indicators

#### 🎨 Priority 3: Communication Panel
- **Add**: Quick-message templates
- **Add**: Voice call integration
- **Add**: Group broadcast messaging

---

## 7. Scale Tickets (/scale-tickets)

### Current Features:
- Scale ticket management
- Weight verification
- Photo uploads
- Ticket history

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Camera Integration UI
```typescript
<div className="glass-card p-6">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-bold">New Scale Ticket</h2>
    <button className="glass-button-secondary">
      <History size={18} />
      Recent Tickets
    </button>
  </div>

  {/* Camera Capture Area */}
  <div className="bg-bg-tertiary rounded-xl p-8 mb-6 text-center border-2 border-dashed border-border-medium hover:border-accent-primary transition-all">
    {!photo ? (
      <div className="space-y-4">
        <Camera size={64} className="mx-auto text-text-tertiary" />
        <div>
          <button className="glass-button-primary mb-2">
            <Camera size={18} />
            Take Photo
          </button>
          <p className="text-sm text-text-tertiary">or drag and drop image here</p>
        </div>
      </div>
    ) : (
      <div className="relative">
        <img src={photo} className="rounded-lg max-h-96 mx-auto" />
        <button
          className="absolute top-2 right-2 bg-danger text-white p-2 rounded-full"
          onClick={() => setPhoto(null)}
        >
          <X size={18} />
        </button>
      </div>
    )}
  </div>

  {/* Weight Input with Visual Scale */}
  <div className="space-y-4">
    <label className="block">
      <span className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
        Gross Weight
      </span>
      <div className="relative mt-2">
        <input
          type="number"
          className="floating-input w-full"
          placeholder="Enter weight in lbs"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Scale size={20} className="text-text-tertiary" />
        </div>
      </div>
    </label>

    {/* Visual Weight Indicator */}
    {weight && (
      <div className="bg-bg-secondary rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-tertiary">Legal Limit</span>
          <span className="text-sm font-bold">80,000 lbs</span>
        </div>
        <ProgressBar
          value={(weight / 80000) * 100}
          variant={weight > 80000 ? 'danger' : 'success'}
          showPercentage
        />
        {weight > 80000 && (
          <p className="text-danger text-sm mt-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            Over legal weight limit
          </p>
        )}
      </div>
    )}
  </div>

  <button className="w-full glass-button-primary mt-6 glow-red-hover">
    <Check size={18} />
    Submit Scale Ticket
  </button>
</div>
```

#### 🎨 Priority 2: OCR Integration
- **Add**: Automatic ticket data extraction from photo
- **Add**: Field-by-field verification UI
- **Visual**: Highlight detected text on image

#### 🎨 Priority 3: Ticket Gallery
- **Add**: Grid view of all tickets with thumbnails
- **Add**: Quick filters by date/load/weight range
- **Add**: Bulk download/export

---

## 8. BOL Templates (/bol-templates)

### Current Features:
- Template library
- Custom template creation
- PDF generation
- E-signature integration

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Template Gallery
```typescript
<div className="space-y-6">
  {/* Header with Actions */}
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-gradient-brand">BOL Templates</h1>
    <button className="glass-button-primary glow-red-hover">
      <PlusCircle size={20} />
      Create Template
    </button>
  </div>

  {/* Template Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {templates.map(template => (
      <div key={template.id} className="glass-card hover:scale-105 transition-transform">
        {/* Preview Thumbnail */}
        <div className="relative h-64 bg-bg-tertiary rounded-t-xl overflow-hidden">
          <img
            src={template.thumbnail}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={template.type}>{template.type}</Badge>
          </div>
        </div>

        {/* Template Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{template.name}</h3>
          <p className="text-sm text-text-tertiary mb-4">
            Used {template.usageCount} times
          </p>

          <div className="flex gap-2">
            <button className="flex-1 glass-button-secondary text-sm">
              <Eye size={16} />
              Preview
            </button>
            <button className="flex-1 glass-button-primary text-sm">
              <FileText size={16} />
              Use
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

#### 🎨 Priority 2: Template Builder
- **Add**: Drag-and-drop field editor
- **Add**: Live preview pane
- **Add**: Field validation rules UI

#### 🎨 Priority 3: E-Signature Modal
- **Add**: Signature pad with smooth pen strokes
- **Add**: Multiple signature styles (draw, type, upload)
- **Visual**: Glass morphism modal with backdrop blur

---

## 9. Documents (/documents)

### Current Features:
- Document library
- Upload functionality
- Organization by category
- Download/share options

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Document Manager UI
```typescript
<div className="flex h-screen">
  {/* Left Sidebar: Categories */}
  <div className="w-64 glass-card p-4 space-y-2">
    <h3 className="font-bold mb-4">Categories</h3>
    {categories.map(cat => (
      <button
        key={cat.id}
        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
          activeCategory === cat.id
            ? 'bg-accent-primary text-white'
            : 'hover:bg-bg-hover'
        }`}
        onClick={() => setActiveCategory(cat.id)}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {cat.icon}
            {cat.name}
          </span>
          <Badge>{cat.count}</Badge>
        </div>
      </button>
    ))}
  </div>

  {/* Main Content: Document Grid */}
  <div className="flex-1 p-6 overflow-y-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">
        {categories.find(c => c.id === activeCategory)?.name}
      </h2>
      <div className="flex gap-2">
        <div className="flex bg-bg-secondary rounded-xl p-1">
          <button className={viewMode === 'grid' ? 'active-view-btn' : 'view-btn'}>
            <Grid size={18} />
          </button>
          <button className={viewMode === 'list' ? 'active-view-btn' : 'view-btn'}>
            <List size={18} />
          </button>
        </div>
        <button className="glass-button-primary">
          <Upload size={18} />
          Upload
        </button>
      </div>
    </div>

    {/* Document Cards */}
    <div className={viewMode === 'grid' ? 'document-grid' : 'document-list'}>
      {documents.map(doc => (
        <DocumentCard
          key={doc.id}
          document={doc}
          viewMode={viewMode}
        />
      ))}
    </div>
  </div>
</div>
```

#### 🎨 Priority 2: Document Preview Modal
- **Add**: Full-screen preview with PDF viewer
- **Add**: Annotation tools (highlight, comment)
- **Add**: Quick actions (download, share, print)

#### 🎨 Priority 3: Drag-and-Drop Upload Zone
- **Add**: Animated upload progress with file icons
- **Add**: Batch upload support
- **Visual**: Pulsing border on drag-over

---

## 10. Factoring (/factoring)

### Current Features:
- Invoice factoring management
- Advance rate calculation
- Payment tracking
- Factoring company integration

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Factoring Dashboard
```typescript
<div className="space-y-6">
  {/* Factoring Summary Cards */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <StatCard
      title="Available Credit"
      value={formatCurrency(factoring.availableCredit)}
      icon={<DollarSign />}
      variant="success"
      className="gradient-border text-gradient-success"
    />
    <StatCard
      title="Pending Advances"
      value={formatCurrency(factoring.pendingAdvances)}
      icon={<Clock />}
      variant="warning"
    />
    <StatCard
      title="Outstanding Balance"
      value={formatCurrency(factoring.outstanding)}
      icon={<AlertCircle />}
      variant="danger"
    />
    <StatCard
      title="Advance Rate"
      value={`${factoring.advanceRate}%`}
      icon={<Percent />}
      progress={factoring.advanceRate}
    />
  </div>

  {/* Quick Factor Invoice */}
  <EnhancedCard
    title="Quick Factor"
    subtitle="Get instant advance on your invoices"
    className="gradient-border"
  >
    <div className="space-y-4">
      {/* Invoice Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Select Invoice
        </label>
        <select className="floating-input w-full">
          <option>Select an invoice to factor...</option>
          {unfactoredInvoices.map(inv => (
            <option key={inv.id} value={inv.id}>
              #{inv.number} - {formatCurrency(inv.amount)} - {inv.customerName}
            </option>
          ))}
        </select>
      </div>

      {/* Advance Calculation */}
      {selectedInvoice && (
        <div className="duotone-subtle-bg rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-text-tertiary">Invoice Amount</span>
            <span className="text-2xl font-bold">
              {formatCurrency(selectedInvoice.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-tertiary">Advance Rate (90%)</span>
            <span className="text-2xl font-bold text-success">
              {formatCurrency(selectedInvoice.amount * 0.9)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-tertiary">Factoring Fee (3%)</span>
            <span className="text-danger">
              -{formatCurrency(selectedInvoice.amount * 0.03)}
            </span>
          </div>
          <hr className="border-border-medium" />
          <div className="flex justify-between items-center">
            <span className="font-bold">You Receive</span>
            <span className="text-3xl font-bold text-gradient-success">
              {formatCurrency(selectedInvoice.amount * 0.87)}
            </span>
          </div>
        </div>
      )}

      <button
        className="w-full glass-button-primary glow-red-hover"
        disabled={!selectedInvoice}
      >
        <Zap size={18} />
        Request Advance (2-24 hours)
      </button>
    </div>
  </EnhancedCard>

  {/* Transaction History */}
  <EnhancedCard title="Factoring History">
    <DataTable
      columns={factoringColumns}
      data={factoringHistory}
      zebra
      stickyHeader
      hover
    />
  </EnhancedCard>
</div>
```

#### 🎨 Priority 2: Real-Time Rate Calculator
- **Add**: Slider input for different advance rates
- **Add**: Live calculation as you type
- **Visual**: Animated number transitions

#### 🎨 Priority 3: Factoring Company Comparison
- **Add**: Side-by-side rate comparison table
- **Add**: Filter by terms, fees, advance speed
- **Visual**: Highlight best deal with glow effect

---

## 11. Invoices (/invoices)

### Current Features:
- Invoice generation
- Payment tracking
- Invoice history
- PDF export

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Invoice Dashboard
```typescript
<div className="space-y-6">
  {/* Invoice Metrics */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <MetricCard
      title="Outstanding"
      value={formatCurrency(invoices.outstanding)}
      subtitle={`${invoices.outstandingCount} invoices`}
      trend="-5%"
      variant="warning"
    />
    <MetricCard
      title="Overdue"
      value={formatCurrency(invoices.overdue)}
      subtitle={`${invoices.overdueCount} invoices`}
      variant="danger"
      icon={<AlertTriangle />}
    />
    <MetricCard
      title="Paid This Month"
      value={formatCurrency(invoices.paidThisMonth)}
      trend="+12%"
      variant="success"
    />
    <MetricCard
      title="Avg Days to Pay"
      value={`${invoices.avgDaysToPay} days`}
      variant="info"
    />
  </div>

  {/* Quick Actions */}
  <div className="flex gap-4">
    <button className="glass-button-primary glow-red-hover">
      <PlusCircle size={18} />
      Create Invoice
    </button>
    <button className="glass-button-secondary">
      <Send size={18} />
      Send Reminders ({invoices.overdueCount})
    </button>
    <button className="glass-button-secondary">
      <Download size={18} />
      Export All
    </button>
  </div>

  {/* Invoice Table */}
  <EnhancedCard>
    <DataTable
      columns={[
        { header: 'Invoice #', accessor: 'number' },
        { header: 'Customer', accessor: 'customer' },
        { header: 'Amount', accessor: 'amount', cell: (row) => (
          <span className="font-bold text-text-primary">
            {formatCurrency(row.amount)}
          </span>
        )},
        { header: 'Status', accessor: 'status', cell: (row) => (
          <StatusBadge status={row.status} />
        )},
        { header: 'Due Date', accessor: 'dueDate', cell: (row) => {
          const isOverdue = new Date(row.dueDate) < new Date()
          return (
            <span className={isOverdue ? 'text-danger font-semibold' : ''}>
              {formatDate(row.dueDate)}
            </span>
          )
        }},
        { header: 'Actions', accessor: 'actions', cell: (row) => (
          <InvoiceActions invoice={row} />
        )}
      ]}
      data={invoices.list}
      zebra
      stickyHeader
      hover
      sortable
      searchable
    />
  </EnhancedCard>
</div>
```

#### 🎨 Priority 2: Invoice Creation Wizard
- **Add**: Multi-step wizard with progress indicator
- **Add**: Line item builder with drag-to-reorder
- **Add**: Live PDF preview

#### 🎨 Priority 3: Payment Tracking Timeline
- **Add**: Visual timeline showing payment history
- **Add**: Payment method icons
- **Add**: Click to view receipt/proof

---

## 12. Compliance (/compliance)

### Current Features:
- Document expiration tracking
- Compliance checklist
- Renewal reminders
- Audit trail

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Compliance Dashboard
```typescript
<div className="space-y-6">
  {/* Compliance Health Score */}
  <div className="glass-card gradient-border p-8 text-center">
    <h2 className="text-xl font-semibold mb-4">Compliance Health Score</h2>
    <div className="relative inline-block">
      {/* Circular Progress */}
      <svg className="w-48 h-48">
        <circle
          cx="96"
          cy="96"
          r="88"
          fill="none"
          stroke="rgba(197, 48, 48, 0.1)"
          strokeWidth="12"
        />
        <circle
          cx="96"
          cy="96"
          r="88"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(compliance.score / 100) * 553} 553`}
          transform="rotate(-90 96 96)"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-bold text-gradient-success">
          {compliance.score}
        </span>
        <span className="text-text-tertiary">out of 100</span>
      </div>
    </div>
    <p className="mt-4 text-text-secondary">
      {compliance.status === 'excellent' && '🎉 Excellent! All requirements met.'}
      {compliance.status === 'good' && '✅ Good standing. Minor items need attention.'}
      {compliance.status === 'warning' && '⚠️ Action required. Some items expiring soon.'}
      {compliance.status === 'critical' && '🚨 Critical! Immediate action required.'}
    </p>
  </div>

  {/* Expiration Alerts */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <AlertCard
      title="Expiring Soon"
      count={compliance.expiringSoon}
      variant="warning"
      icon={<Clock />}
      items={compliance.itemsExpiringSoon}
    />
    <AlertCard
      title="Expired"
      count={compliance.expired}
      variant="danger"
      icon={<AlertCircle />}
      items={compliance.itemsExpired}
    />
    <AlertCard
      title="Up to Date"
      count={compliance.upToDate}
      variant="success"
      icon={<CheckCircle />}
    />
  </div>

  {/* Document Checklist */}
  <EnhancedCard title="Compliance Requirements">
    <div className="space-y-3">
      {compliance.requirements.map(req => (
        <ComplianceItem
          key={req.id}
          requirement={req}
          onRenew={() => handleRenew(req)}
          onUpload={() => handleUpload(req)}
        />
      ))}
    </div>
  </EnhancedCard>
</div>

// ComplianceItem Component
const ComplianceItem = ({ requirement, onRenew, onUpload }) => {
  const daysUntilExpiry = differenceInDays(new Date(requirement.expiryDate), new Date())
  const status = daysUntilExpiry < 0 ? 'expired' : daysUntilExpiry < 30 ? 'warning' : 'valid'

  return (
    <div className={`
      flex items-center justify-between p-4 rounded-lg border-2
      ${status === 'expired' ? 'border-danger bg-danger/5' : ''}
      ${status === 'warning' ? 'border-warning bg-warning/5' : ''}
      ${status === 'valid' ? 'border-success bg-success/5' : ''}
    `}>
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          status === 'expired' ? 'bg-danger' :
          status === 'warning' ? 'bg-warning' :
          'bg-success'
        }`}>
          {status === 'expired' && <X size={24} className="text-white" />}
          {status === 'warning' && <AlertTriangle size={24} className="text-white" />}
          {status === 'valid' && <CheckCircle size={24} className="text-white" />}
        </div>

        {/* Info */}
        <div>
          <h4 className="font-semibold">{requirement.name}</h4>
          <p className="text-sm text-text-tertiary">
            {status === 'expired' && `Expired ${Math.abs(daysUntilExpiry)} days ago`}
            {status === 'warning' && `Expires in ${daysUntilExpiry} days`}
            {status === 'valid' && `Valid until ${formatDate(requirement.expiryDate)}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {requirement.documentId ? (
          <button className="glass-button-secondary">
            <Eye size={16} />
            View
          </button>
        ) : (
          <button className="glass-button-secondary" onClick={onUpload}>
            <Upload size={16} />
            Upload
          </button>
        )}
        {(status === 'expired' || status === 'warning') && (
          <button className="glass-button-primary" onClick={onRenew}>
            <RefreshCw size={16} />
            Renew
          </button>
        )}
      </div>
    </div>
  )
}
```

#### 🎨 Priority 2: Auto-Renewal Workflow
- **Add**: One-click renewal initiation
- **Add**: Integration with state DMV/DOT portals
- **Add**: Progress tracking for renewal applications

#### 🎨 Priority 3: Compliance Calendar
- **Add**: Monthly view showing all expiration dates
- **Add**: Color-coded by document type
- **Add**: Click to add reminder/renew

---

# 🏢 CUSTOMER ROLE FEATURES

## Navigation Overview (CustomerLayout)

```
┌─ CustomerLayout (Fixed 280px)
├─ Logo Section
├─ Quick Action: "Post New Load" (gradient button)
├─ Navigation Items (10):
│  ├─ Dashboard (/customer-dashboard)
│  ├─ My Loads (/customer/loads)
│  ├─ Truck Board (/customer/truck-board)
│  ├─ Job Sites (/customer/job-sites)
│  ├─ Schedule (/customer/schedule)
│  ├─ Documents (/customer/documents)
│  ├─ Invoices (/customer/invoices)
│  ├─ Carriers (/customer/carriers)
│  ├─ Billing (/customer/billing)
│  └─ Settings (/settings)
└─ Status Card (Active Loads / In Transit)
```

---

## 1. Customer Dashboard (/customer-dashboard)

### Current Features:
- Load statistics overview
- Recent activity feed
- Carrier performance metrics
- Quick actions

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Executive Dashboard
```typescript
<div className="space-y-6">
  {/* Hero Stats */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <HeroStatCard
      title="Active Loads"
      value={dashboard.activeLoads}
      subtitle="In progress"
      icon={<Package />}
      gradient="red-purple"
      trend="+8%"
    />
    <HeroStatCard
      title="Completed Today"
      value={dashboard.completedToday}
      subtitle="Deliveries"
      icon={<CheckCircle />}
      gradient="green"
      trend="+12%"
    />
    <HeroStatCard
      title="This Month"
      value={formatCurrency(dashboard.spendThisMonth)}
      subtitle="Total spend"
      icon={<DollarSign />}
      gradient="blue"
      trend="-3%"
    />
    <HeroStatCard
      title="On-Time Rate"
      value={`${dashboard.onTimeRate}%`}
      subtitle="Carrier performance"
      icon={<TrendingUp />}
      gradient="purple"
      progress={dashboard.onTimeRate}
    />
  </div>

  {/* Activity Timeline */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <EnhancedCard title="Recent Activity" subtitle="Last 24 hours">
      <ActivityTimeline activities={dashboard.recentActivity} />
    </EnhancedCard>

    <EnhancedCard title="Top Carriers" subtitle="By delivery volume">
      <CarrierLeaderboard carriers={dashboard.topCarriers} />
    </EnhancedCard>
  </div>

  {/* Load Status Overview */}
  <EnhancedCard title="Load Pipeline">
    <div className="grid grid-cols-5 gap-4">
      {['Posted', 'Assigned', 'Picked Up', 'In Transit', 'Delivered'].map((status, idx) => (
        <div key={status} className="text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full mx-auto gradient-border flex items-center justify-center text-2xl font-bold">
              {dashboard.loadsByStatus[status]}
            </div>
            {idx < 4 && (
              <div className="absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-accent-primary to-transparent" />
            )}
          </div>
          <p className="text-sm font-semibold">{status}</p>
        </div>
      ))}
    </div>
  </EnhancedCard>
</div>
```

#### 🎨 Priority 2: Cost Analytics Widget
- **Add**: Spending trends chart (daily/weekly/monthly)
- **Add**: Cost per load breakdown
- **Visual**: Duotone gradient area chart

#### 🎨 Priority 3: Quick Post Load CTA
- **Add**: Floating action button (FAB) in bottom-right
- **Add**: One-click quick post with saved preferences
- **Visual**: Pulsing animation to draw attention

---

## 2. My Loads (/customer/loads)

### Current Features:
- Posted loads list
- Load status tracking
- Carrier assignments
- Communication tools

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Load Management Board
```typescript
<div className="space-y-6">
  {/* Filter Bar */}
  <div className="glass-card p-4 flex items-center gap-4">
    <div className="flex-1">
      <input
        type="text"
        placeholder="Search loads by ID, origin, destination..."
        className="floating-input w-full"
      />
    </div>
    <div className="flex gap-2">
      <FilterDropdown label="Status" options={statusFilters} />
      <FilterDropdown label="Carrier" options={carriers} />
      <FilterDropdown label="Date Range" type="dateRange" />
    </div>
    <button className="glass-button-primary">
      <PlusCircle size={18} />
      Post Load
    </button>
  </div>

  {/* View Toggle */}
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold">My Loads</h2>
    <div className="flex gap-2">
      <ViewToggle views={['kanban', 'list', 'calendar']} active={viewMode} onChange={setViewMode} />
    </div>
  </div>

  {/* Kanban View */}
  {viewMode === 'kanban' && (
    <div className="grid grid-cols-5 gap-4">
      {stages.map(stage => (
        <div key={stage} className="glass-card p-4">
          <h3 className="font-bold mb-4 flex items-center justify-between">
            {stage}
            <Badge>{loads.filter(l => l.stage === stage).length}</Badge>
          </h3>
          <div className="space-y-3">
            {loads.filter(l => l.stage === stage).map(load => (
              <LoadKanbanCard key={load.id} load={load} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )}

  {/* List View */}
  {viewMode === 'list' && (
    <EnhancedCard>
      <DataTable
        columns={loadColumns}
        data={loads}
        zebra
        stickyHeader
        hover
        expandable
        renderExpandedRow={(load) => <LoadDetails load={load} />}
      />
    </EnhancedCard>
  )}

  {/* Calendar View */}
  {viewMode === 'calendar' && (
    <LoadCalendar loads={loads} onDateClick={handleDateClick} />
  )}
</div>
```

#### 🎨 Priority 2: Real-Time Load Tracking
- **Add**: Live location markers on map
- **Add**: ETA countdown with progress bar
- **Add**: Milestone notifications (pickup confirmed, delivery in progress)

#### 🎨 Priority 3: Carrier Chat Integration
- **Add**: Inline chat panel for each load
- **Add**: Quick message templates
- **Add**: File attachment support (BOL, photos)

---

## 3. Truck Board (/customer/truck-board)

### Current Features:
- Available carriers
- Equipment search
- Carrier profiles
- Request quotes

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Carrier Marketplace UI
```typescript
<div className="space-y-6">
  {/* Search & Filter Bar */}
  <div className="glass-card p-6">
    <h2 className="text-xl font-bold mb-4">Find Available Carriers</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="text-sm font-semibold mb-2 block">Equipment Type</label>
        <select className="floating-input w-full">
          <option>Flatbed</option>
          <option>Van</option>
          <option>Reefer</option>
          <option>Stepdeck</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block">Location</label>
        <input type="text" placeholder="City, State or ZIP" className="floating-input w-full" />
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block">Available Date</label>
        <input type="date" className="floating-input w-full" />
      </div>
      <div className="flex items-end">
        <button className="glass-button-primary w-full">
          <Search size={18} />
          Search
        </button>
      </div>
    </div>
  </div>

  {/* Carrier Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {carriers.map(carrier => (
      <EnhancedCard key={carrier.id} hover className="gradient-border">
        {/* Carrier Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={carrier.logo}
              className="w-16 h-16 rounded-lg object-cover"
            />
            {carrier.verified && (
              <div className="absolute -top-1 -right-1 bg-success rounded-full p-1">
                <CheckCircle size={16} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{carrier.name}</h3>
            <p className="text-sm text-text-tertiary">{carrier.location}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-warning fill-warning" />
                <span className="font-semibold">{carrier.rating}</span>
              </div>
              <span className="text-text-tertiary text-sm">
                ({carrier.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Carrier Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatPill label="Loads" value={carrier.totalLoads} />
          <StatPill label="On-Time" value={`${carrier.onTimeRate}%`} />
          <StatPill label="Equipment" value={carrier.equipmentCount} />
        </div>

        {/* Available Equipment */}
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Available Equipment</p>
          <div className="flex flex-wrap gap-2">
            {carrier.availableEquipment.map(eq => (
              <Badge key={eq} variant="equipment">
                {eq}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 glass-button-secondary">
            <Eye size={16} />
            View Profile
          </button>
          <button className="flex-1 glass-button-primary">
            <MessageSquare size={16} />
            Request Quote
          </button>
        </div>
      </EnhancedCard>
    ))}
  </div>
</div>
```

#### 🎨 Priority 2: Carrier Comparison Tool
- **Add**: Side-by-side comparison view (up to 3 carriers)
- **Add**: Rate, reviews, on-time %, equipment availability
- **Visual**: Highlight best value with glow effect

#### 🎨 Priority 3: Instant Quote Modal
- **Add**: Quick-quote form with load details
- **Add**: Real-time price estimation
- **Add**: Multiple carrier bidding view

---

## 4. Job Sites (/customer/job-sites)

### Current Features:
- Job site directory
- Site details management
- Contact information
- Delivery instructions

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Job Site Manager
```typescript
<div className="space-y-6">
  {/* Header */}
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-gradient-brand">Job Sites</h1>
    <button className="glass-button-primary glow-red-hover">
      <PlusCircle size={20} />
      Add Job Site
    </button>
  </div>

  {/* Job Site Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {jobSites.map(site => (
      <div key={site.id} className="glass-card hover:scale-105 transition-transform">
        {/* Site Image */}
        <div className="relative h-48 bg-bg-tertiary rounded-t-xl overflow-hidden">
          <img
            src={site.image || '/placeholder-site.jpg'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-lg">{site.name}</h3>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <MapPin size={14} />
              {site.city}, {site.state}
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant={site.status === 'active' ? 'success' : 'default'}>
              {site.status}
            </Badge>
          </div>
        </div>

        {/* Site Info */}
        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatPill label="Loads" value={site.totalLoads} />
            <StatPill label="Active" value={site.activeLoads} />
            <StatPill label="Value" value={formatCompactCurrency(site.totalValue)} />
          </div>

          {/* Contact */}
          <div className="bg-bg-secondary rounded-lg p-3">
            <p className="text-xs text-text-tertiary mb-1">Site Contact</p>
            <p className="font-semibold text-sm">{site.contactName}</p>
            <p className="text-sm text-text-secondary">{site.contactPhone}</p>
          </div>

          {/* Special Instructions */}
          {site.specialInstructions && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <p className="text-xs text-warning font-semibold mb-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                Special Instructions
              </p>
              <p className="text-xs text-text-secondary">{site.specialInstructions}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 glass-button-secondary">
              <Edit size={16} />
              Edit
            </button>
            <button className="flex-1 glass-button-primary">
              <Navigation size={16} />
              View Map
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

#### 🎨 Priority 2: Interactive Map View
- **Add**: Toggle to map view showing all job sites
- **Add**: Cluster markers for nearby sites
- **Add**: Click marker to view site details

#### 🎨 Priority 3: Site Activity Feed
- **Add**: Timeline of all deliveries to each site
- **Add**: Carrier performance by site
- **Add**: Issue tracking (delays, access problems)

---

## 5. Schedule (/customer/schedule)

### Current Features:
- Calendar view of deliveries
- Appointment scheduling
- Recurring load management
- Timeline view

### UI Enhancement Recommendations:

#### 🎨 Priority 1: Advanced Calendar
```typescript
<div className="glass-card p-6">
  {/* Calendar Header */}
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-4">
      <button className="glass-button-secondary">
        <ChevronLeft size={18} />
      </button>
      <h2 className="text-2xl font-bold">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button className="glass-button-secondary">
        <ChevronRight size={18} />
      </button>
    </div>
    <div className="flex gap-2">
      <ViewToggle views={['month', 'week', 'day']} active={calendarView} />
      <button className="glass-button-primary">
        <PlusCircle size={18} />
        Schedule Delivery
      </button>
    </div>
  </div>

  {/* Month View */}
  <div className="grid grid-cols-7 gap-2">
    {/* Day Headers */}
    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
      <div key={day} className="text-center font-semibold text-text-tertiary text-sm p-2">
        {day}
      </div>
    ))}

    {/* Date Cells */}
    {calendarDays.map(day => {
      const deliveries = getDeliveriesForDay(day)
      const isToday = isSameDay(day, new Date())

      return (
        <div
          key={day.toString()}
          className={`
            min-h-32 p-2 rounded-lg border transition-all cursor-pointer
            ${isToday ? 'border-accent-primary bg-accent-subtle' : 'border-border-subtle'}
            hover:bg-bg-hover
          `}
          onClick={() => handleDayClick(day)}
        >
          <div className={`
            text-sm font-semibold mb-2
            ${isToday ? 'text-accent-primary' : 'text-text-primary'}
          `}>
            {format(day, 'd')}
          </div>

          <div className="space-y-1">
            {deliveries.slice(0, 3).map(delivery => (
              <div
                key={delivery.id}
                className="text-xs p-1 rounded bg-bg-secondary hover:bg-bg-hover truncate"
              >
                <span className="font-semibold">{format(delivery.time, 'HH:mm')}</span>
                {' '}
                {delivery.location}
              </div>
            ))}
            {deliveries.length > 3 && (
              <div className="text-xs text-text-tertiary text-center">
                +{deliveries.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    })}
  </div>
</div>
```

#### 🎨 Priority 2: Drag-and-Drop Rescheduling
- **Add**: Drag delivery cards to new dates
- **Add**: Visual feedback during drag
- **Add**: Conflict detection and warnings

#### 🎨 Priority 3: Recurring Load Templates
- **Add**: Save frequent routes as templates
- **Add**: One-click schedule from template
- **Add**: Bulk scheduling for multiple dates

---

## 6-10. Remaining Customer Features

### Documents, Invoices, Carriers, Billing, Settings

Similar enhancement patterns apply:
- **Glass morphism cards**
- **Enhanced data tables** with sticky headers, zebra striping
- **Quick action buttons** with hover effects
- **Status badges** with animations
- **Floating action buttons** for primary actions
- **Advanced filters** with slide-out panels
- **Export/share** functionality
- **Real-time updates** with skeleton loaders

---

# 🎯 HEADER & SHARED COMPONENTS

## S1Header (Carrier Header)

### Current Features:
✅ Search bar
✅ Theme toggle (dark/light)
✅ Messages dropdown with unread count
✅ Notifications dropdown
✅ Profile menu with role switcher
✅ Real-time message/notification fetching (30s polling)

### UI Enhancements:

#### 🎨 Priority 1: Glass Morphism Header
```css
.header {
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
```

#### 🎨 Priority 2: Enhanced Search
- **Add**: Search suggestions dropdown
- **Add**: Recent searches
- **Add**: Search by category (loads, drivers, equipment)
- **Visual**: Glass morphism dropdown with keyboard shortcuts

#### 🎨 Priority 3: Notification Enhancements
- **Add**: Categorized notifications (loads, messages, system)
- **Add**: Mark as read animation (fade + slide out)
- **Add**: Priority indicators (color-coded dots)
- **Visual**: Smooth slide-in animation for dropdown

---

## CustomerLayout Header

### Current Features:
✅ Search bar
✅ Theme toggle
✅ Notifications
✅ Profile menu with avatar

### UI Enhancements:
Same as S1Header plus:
- **Add**: Quick post load button in header
- **Add**: Carrier favorites dropdown
- **Add**: Budget/spend tracker widget

---

# 📊 IMPLEMENTATION PRIORITY MATRIX

## Phase 1: Quick Wins (1 week)

### Carrier Features:
1. ✅ Dashboard stat cards (gradient borders, animated counters)
2. ✅ Driver status cards (HOS circular progress, live indicators)
3. ✅ Load board cards (duotone gradients, enhanced badges)
4. ✅ Enhanced hover states across all cards

### Customer Features:
1. ✅ Dashboard hero stats (gradient backgrounds)
2. ✅ My Loads kanban board
3. ✅ Truck board carrier cards
4. ✅ Job site cards with images

### Shared:
1. ✅ Glass morphism headers
2. ✅ Enhanced notification dropdowns
3. ✅ Status badges with animations
4. ✅ Floating action buttons

**Estimated Time**: 5-7 days
**Impact**: High visual improvement, immediate user delight

---

## Phase 2: Feature Enhancements (2 weeks)

### Carrier Features:
1. ✅ Map integration (load board, dispatch)
2. ✅ Kanban boards (My Loads, Dispatch)
3. ✅ Data visualization charts (duotone)
4. ✅ Document preview modals

### Customer Features:
1. ✅ Calendar views with drag-drop
2. ✅ Carrier comparison tool
3. ✅ Real-time load tracking
4. ✅ Job site map view

### Shared:
1. ✅ Advanced search with filters
2. ✅ Enhanced data tables
3. ✅ Export functionality
4. ✅ Bulk operations

**Estimated Time**: 10-14 days
**Impact**: Major functionality improvements

---

## Phase 3: Advanced Features (3 weeks)

### All Features:
1. ✅ Real-time updates (WebSocket)
2. ✅ Advanced animations (success/error states)
3. ✅ PWA features (offline mode)
4. ✅ Mobile optimizations
5. ✅ Performance optimizations

**Estimated Time**: 15-21 days
**Impact**: Production-ready polish

---

# 🎨 DESIGN SYSTEM SUMMARY

## Colors (Maintained)
- Primary: #C53030 ✅
- Dark BG: #0A0E1A ✅
- All status colors maintained ✅

## New Additions
- Multi-layer shadows (elevation system)
- Gradient borders
- Duotone overlays
- Glass morphism effects
- Animated state transitions

## Components to Create
1. EnhancedCard (with variants)
2. StatusBadge (with animations)
3. DataTable (with all features)
4. LoadCard (multiple layouts)
5. DriverCard (with HOS visual)
6. CarrierCard (marketplace)
7. JobSiteCard (with image)
8. StatCard (with trends)
9. ProgressBar (with gradient)
10. FloatingActionButton

---

# ✅ FINAL RECOMMENDATIONS

## Do First:
1. ✅ Implement EnhancedCard component
2. ✅ Add multi-layer shadow system
3. ✅ Create StatusBadge animations
4. ✅ Enhance dashboard stat cards
5. ✅ Add gradient borders to CTAs

## Focus Areas by Role:

### Carrier Priority:
1. Driver management UX (HOS visuals, quick actions)
2. Dispatch command center (kanban + map)
3. Scale ticket camera integration
4. Compliance dashboard (health score)

### Customer Priority:
1. Load posting wizard (multi-step, preview)
2. Carrier marketplace (comparison, quotes)
3. Job site management (map, images)
4. Schedule calendar (drag-drop)

## Universal:
1. Real-time updates (live data)
2. Mobile responsiveness
3. Accessibility compliance
4. Performance optimization

---

**Next Steps**: Would you like me to implement any specific feature enhancement from this audit? I can start with the highest-impact quick wins or focus on a particular role's features.
